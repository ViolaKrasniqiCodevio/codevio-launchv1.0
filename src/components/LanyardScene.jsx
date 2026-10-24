import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useBeforePhysicsStep,
  useRapier,
  useRopeJoint,
  useSphericalJoint,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

import cardGLB from '../assets/card.glb?url';
import lanyard from '../assets/codevio_strip1.png';

import * as THREE from 'three';

extend({ MeshLineGeometry, MeshLineMaterial });

const MAX_SCENE_COORD = 1e4;

// A frame longer than this is a startup hitch (shader compile, texture or GLB
// upload). Rapier clamps each frame to 0.5s of simulated time, so a frame like
// that would be stepped as ~30 substeps at once and the card would appear to
// teleport. A device that is merely slow (steady long frames) is not hitching,
// which is why the guard also compares against the recent frame baseline.
const HEALTHY_FRAME_DELTA = 0.08;

const ZERO_GRAVITY = [0, 0, 0];

const isFrameSpike = (delta, baseline) =>
  delta > HEALTHY_FRAME_DELTA && delta > baseline * 2;

const isSaneVec3 = (v) =>
  Boolean(v) &&
  Number.isFinite(v.x) &&
  Number.isFinite(v.y) &&
  Number.isFinite(v.z) &&
  Math.abs(v.x) < MAX_SCENE_COORD &&
  Math.abs(v.y) < MAX_SCENE_COORD &&
  Math.abs(v.z) < MAX_SCENE_COORD;

useGLTF.preload(cardGLB);

export default function LanyardScene({
  position,
  gravity,
  fov,
  transparent,
  isMobile,
  spinning,
  visible,
  onReady,
}) {
  // The CSS guard and MotionConfig in src/index.css / src/App.jsx cover CSS,
  // framer-motion and GSAP, but not the physics: without this the badge still
  // swings under gravity and spins for someone who asked for reduced motion.
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const animated = !reduceMotion;
  const physicsGravity = animated ? gravity : ZERO_GRAVITY;

  return (
    <Canvas
      frameloop={visible ? 'always' : 'never'}
      camera={{ position, fov }}
      dpr={[1, isMobile ? 1.5 : 2]}
      gl={{ alpha: transparent }}
      onCreated={({ gl }) =>
        gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
      }
    >
      <ambientLight intensity={Math.PI} />

      <Physics
        gravity={physicsGravity}
        timeStep={isMobile ? 1 / 30 : 1 / 60}
      >
        <GravityGuard gravity={physicsGravity} />

        <Band
          isMobile={isMobile}
          active={animated}
          spinning={spinning && !reduceMotion}
          onReady={onReady}
        />
      </Physics>

      <Environment blur={0.75}>
        <Lightformer
          intensity={2}
          color="white"
          position={[0, -1, 5]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          intensity={3}
          color="white"
          position={[-1, -1, 1]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          intensity={3}
          color="white"
          position={[1, 1, 1]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          intensity={10}
          color="white"
          position={[-10, 0, 14]}
          rotation={[0, Math.PI / 2, Math.PI / 3]}
          scale={[100, 10, 1]}
        />
      </Environment>

      <Precompile />
    </Canvas>
  );
}

function Precompile() {
  const gl = useThree(state => state.gl);
  const scene = useThree(state => state.scene);
  const camera = useThree(state => state.camera);

  // Compile every material before the first frame is rendered. Shader
  // compilation is the long stall a cold first frame would otherwise take
  // right after the card has been painted, freezing it at the top; doing it
  // here means the drop can start on the very first painted frame.
  useLayoutEffect(() => {
    gl.compile(scene, camera);
  }, [gl, scene, camera]);

  return null;
}

function GravityGuard({ gravity }) {
  const { rapier } = useRapier();
  const desiredGravity = useMemo(
    () => new rapier.Vector3(gravity[0], gravity[1], gravity[2]),
    [rapier, gravity]
  );
  const noGravity = useMemo(() => new rapier.Vector3(0, 0, 0), [rapier]);
  const baseline = useRef(1 / 60);
  const spiking = useRef(false);

  // The negative priority makes this run before rapier's fixed-step stepper,
  // so the spike check always sees the frame that is about to be simulated.
  // Muting gravity on a spike keeps a hitch from being turned into one giant
  // fall step without delaying the drop, and a steadily slow device still
  // gets to fall.
  useFrame((_, delta) => {
    spiking.current = isFrameSpike(delta, baseline.current);
    baseline.current += (Math.min(delta, 0.1) - baseline.current) * 0.5;
  }, -1);

  useBeforePhysicsStep(world => {
    if (!spiking.current) {
      world.gravity = desiredGravity;
      return;
    }

    // A frame this long was a browser hitch; rapier clamps it to 0.5s of
    // simulated time, so besides muting gravity the bodies are held still.
    // Nothing moves during a frame the user cannot see anyway, and the fall
    // or swing continues from the same pose instead of jumping.
    world.gravity = noGravity;
    world.bodies.forEach(body => {
      body.setLinvel(noGravity, false);
      body.setAngvel(noGravity, false);
    });
  });

  return null;
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false, active, spinning, onReady }) {
  const band = useRef();
  const fixed = useRef();
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();
  const card = useRef();

  const reported = useRef(false);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const { nodes, materials } = useGLTF(cardGLB);
  const texture = useTexture(lanyard);

  const [curve] = useState(() => {
    const initialCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    initialCurve.curveType = 'chordal';
    return initialCurve;
  });

  useLayoutEffect(() => {
    // drei's cached texture must be shared with repeat wrapping for the band material.
    // eslint-disable-next-line react-hooks/immutability
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  }, [texture]);

  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [
    [0, 0, 0],
    [0, 0, 0],
    1,
  ]);
  useRopeJoint(j1, j2, [
    [0, 0, 0],
    [0, 0, 0],
    1,
  ]);
  useRopeJoint(j2, j3, [
    [0, 0, 0],
    [0, 0, 0],
    1,
  ]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0],
  ]);

  const releaseCard = e => {
    if (e?.target?.hasPointerCapture?.(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId);
    }

    drag(false);
  };

  useEffect(() => {
    if (hovered && !isMobile) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';

      return () => {
        document.body.style.cursor = 'auto';
      };
    }
  }, [hovered, dragged, isMobile]);

  useFrame((state, delta) => {
    if (!reported.current) {
      // Tell the parent the scene is painting (used to stop the initial spin
      // after a few seconds). Gravity does not wait for this: it is desired
      // from mount and GravityGuard only lets it act on spike-free frames, so
      // the drop starts on the first clean frame the scene renders.
      reported.current = true;
      onReady?.();
    }

    if (dragged && !isMobile) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));

      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());

      const dragTarget = {
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      };

      if (isSaneVec3(dragTarget)) {
        card.current?.setNextKinematicTranslation(dragTarget);
      }
    }

    if (fixed.current) {
      [j1, j2].forEach(ref => {
        const body = ref.current;
        if (!body) return;

        const translation = body.translation();
        if (!body.lerped || !isSaneVec3(body.lerped)) {
          body.lerped = new THREE.Vector3().copy(translation);
        }

        if (!isSaneVec3(translation)) return;

        const clampedDistance = Math.max(
          0.1,
          Math.min(1, body.lerped.distanceTo(translation))
        );

        body.lerped.lerp(
          translation,
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });

      const j1Body = j1.current;
      const j2Body = j2.current;
      const j3Body = j3.current;
      const cardBody = card.current;

      if (
        j1Body?.lerped &&
        isSaneVec3(j1Body.lerped) &&
        isSaneVec3(j2Body?.lerped) &&
        isSaneVec3(j3Body?.translation()) &&
        isSaneVec3(fixed.current.translation())
      ) {
        curve.points[0].copy(j3Body.translation());
        curve.points[1].copy(j2Body.lerped);
        curve.points[2].copy(j1Body.lerped);
        curve.points[3].copy(fixed.current.translation());

        if (band.current?.geometry) {
          const points = curve.getPoints(isMobile ? 16 : 32);
          if (points.every(isSaneVec3)) {
            band.current.geometry.setPoints(points);
          }
        }
      }

      if (cardBody) {
        ang.copy(cardBody.angvel());
        rot.copy(cardBody.rotation());

        if (!isSaneVec3(ang)) {
          ang.set(0, 0, 0);
        }

        if (spinning) {
          cardBody.setAngvel({ x: ang.x, y: 1.5, z: ang.z });
        } else if (active) {
          const facingFront = Math.cos(rot.y) > 0.999;
          cardBody.setAngvel({
            x: ang.x,
            y: facingFront ? 0 : 1.2,
            z: ang.z,
          });
        }
      }
    }
  });

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />

        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody
          position={[1.5, -1.5, 0]}
          ref={card}
          {...segmentProps}
          type={dragged && !isMobile ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />

          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={isMobile ? undefined : () => hover(true)}
            onPointerOut={isMobile ? undefined : () => hover(false)}
            onPointerUp={isMobile ? undefined : releaseCard}
            onPointerCancel={isMobile ? undefined : releaseCard}
            onLostPointerCapture={isMobile ? undefined : releaseCard}
            onPointerDown={
              isMobile
                ? undefined
                : e => {
                    e.stopPropagation();
                    e.target.setPointerCapture(e.pointerId);

                    drag(
                      new THREE.Vector3()
                        .copy(e.point)
                        .sub(vec.copy(card.current.translation()))
                    );
                  }
            }
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={materials.base.map}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>

            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.3}
            />

            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
      </>
    );
  }
 