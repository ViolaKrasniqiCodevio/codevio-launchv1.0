import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useForm } from '@formspree/react';

import SpecularButton from './SpecularButton';
import { CONTACT_FORM, FORMSPREE_FORM_ID, SITE } from '../data/site';
import { reveal } from '../lib/motion';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_FILL_TIME_MS = 1500;
const SEND_ANOTHER_DELAY_MS = 600;

const TEXT_FIELDS = [
  {
    name: 'name',
    label: 'Full name',
    placeholder: 'Your name',
    type: 'text',
    autoComplete: 'name',
    required: true,
  },
  {
    name: 'email',
    label: 'Work email',
    placeholder: 'you@company.com',
    type: 'email',
    autoComplete: 'email',
    required: true,
  },
];

const EMPTY_VALUES = {
  name: '',
  email: '',
  message: '',
};

function validate(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = 'Please add your name.';
  } else if (values.name.trim().length < 2) {
    errors.name = 'That name looks too short.';
  }

  if (!values.email.trim()) {
    errors.email = 'Please add your work email.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'That email address does not look right.';
  }

  if (!values.message.trim()) {
    errors.message = 'Tell us a little about the project.';
  } else if (values.message.trim().length < 10) {
    errors.message = 'A bit more detail helps us reply usefully.';
  }

  return errors;
}

const fieldClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-base text-white outline-none transition-colors duration-300 placeholder:text-white/60 hover:border-white/20 focus:border-[#f5b8c4]/70 focus:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#f5b8c4]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]';

const invalidClass = 'border-[#fcd34d]/70 bg-[#fcd34d]/5';

const errorClass =
  'mt-1.5 flex items-center gap-1.5 text-base leading-snug text-[#fcd34d]';

function FieldError({ id, children }) {
  return (
    <p id={id} role="alert" className={errorClass}>
      <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

export default function ContactForm() {
  const [formspreeState, submitToFormspree, resetFormspree] = useForm(FORMSPREE_FORM_ID);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState('idle');
  const [formError, setFormError] = useState('');
  const [canSendAnother, setCanSendAnother] = useState(false);

  const submittingRef = useRef(false);
  const fieldRefs = useRef({});
  const openedAtRef = useRef(0);
  const successRef = useRef(null);

  useEffect(() => {
    openedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (status !== 'success') return undefined;

    // Move focus into the confirmation: the form it replaces is gone, so without
    // this a screen reader stays on a removed node and announces nothing.
    successRef.current?.focus();

    const timer = setTimeout(() => setCanSendAnother(true), SEND_ANOTHER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status]);

  const isSubmitting = status === 'submitting';

  function showSuccess() {
    setCanSendAnother(false);
    setStatus('success');
  }

  useEffect(() => {
    if (status !== 'submitting') return;

    if (formspreeState.succeeded) {
      const timer = setTimeout(() => {
        submittingRef.current = false;
        showSuccess();
      }, 0);
      return () => clearTimeout(timer);
    }

    if (formspreeState.errors) {
      const timer = setTimeout(() => {
        submittingRef.current = false;
        setFormError('We could not send your message. Please try again or email us directly.');
        setStatus('error');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [formspreeState.errors, formspreeState.succeeded, status]);

  function updateField(name, value) {
    setValues((previous) => ({ ...previous, [name]: value }));

    setErrors((previous) => {
      if (!previous[name]) return previous;

      const next = { ...previous };
      delete next[name];
      return next;
    });
  }

  function reset() {
    setValues(EMPTY_VALUES);
    setErrors({});
    setHoneypot('');
    setFormError('');
    setStatus('idle');
    resetFormspree();
    openedAtRef.current = Date.now();

    // "Send another" swaps the confirmation for a fresh form, which unmounts the
    // node that had focus and drops it back to <body>. Move it to the first field
    // once that form has committed.
    requestAnimationFrame(() => fieldRefs.current.name?.focus());
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submittingRef.current || isSubmitting) return;

    setFormError('');

    const nextErrors = validate(values);
    setErrors(nextErrors);

    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus();
      return;
    }

    // Answer scrapers with a success state so the trap stays unadvertised, and
    // skip the request. Formspree filters the same submission server-side.
    const looksAutomated =
      honeypot.trim() !== '' || Date.now() - openedAtRef.current < MIN_FILL_TIME_MS;

    if (looksAutomated) {
      showSuccess();
      return;
    }

    // Clear the previous submission's flags so this one can never observe them.
    resetFormspree();
    submittingRef.current = true;
    setStatus('submitting');

    try {
      await submitToFormspree(event);
    } catch {
      setFormError(
        'We could not reach the form service. Check your connection, or email us directly.',
      );
      setStatus('error');
    } finally {
      submittingRef.current = false;
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        {...reveal()}
        ref={successRef}
        tabIndex={-1}
        className="liquid-glass mx-auto flex aspect-square w-full max-w-sm flex-col rounded-2xl border border-[#f5b8c4]/30 p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-1 flex-col items-center justify-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-[#f5b8c4]/10 ring-1 ring-[#f5b8c4]/25">
            <CheckCircle2 className="size-7 text-[#f5b8c4]" aria-hidden="true" />
          </span>

          <p className="mt-6 font-['Bebas_Neue'] text-2xl uppercase tracking-[0.12em] text-white">
            Message sent
          </p>

          <p className="mt-3 max-w-[17rem] text-lg leading-snug text-white/70">
            Thanks for reaching out. {SITE.responseTime}
          </p>
        </div>

        <SpecularButton
          type="button"
          size="md"
          onClick={reset}
          disabled={!canSendAnother}
          className="mt-6 self-center font-['Bebas_Neue'] uppercase tracking-[0.12em]"
        >
          Send another
        </SpecularButton>
      </motion.div>
    );
  }

  return (
    <motion.form
      {...reveal()}
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
      aria-labelledby="contact-form-heading"
      action={CONTACT_FORM.endpoint}
      method="POST"
      className="relative text-left"
    >
      <h2 id="contact-form-heading" className="sr-only">
        Send a message
      </h2>

      <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
        {TEXT_FIELDS.map((field) => {
          const errorId = `contact-${field.name}-error`;
          const hasError = Boolean(errors[field.name]);

          return (
            <div key={field.name} className="text-left">
              <label
                htmlFor={`contact-${field.name}`}
                className="mb-2 block text-left font-['Bebas_Neue'] text-sm uppercase tracking-[0.12em] text-white/80"
              >
                {field.label}
                {field.required ? (
                  <span aria-hidden="true" className="ml-1 text-[#db364e]">
                    *
                  </span>
                ) : null}
              </label>

              <input
                id={`contact-${field.name}`}
                name={field.name}
                ref={(node) => {
                  fieldRefs.current[field.name] = node;
                }}
                type={field.type}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                value={values[field.name]}
                onChange={(event) => updateField(field.name, event.target.value)}
                aria-invalid={hasError}
                aria-required={field.required ? 'true' : undefined}
                aria-describedby={hasError ? errorId : undefined}
                className={`${fieldClass} text-left ${hasError ? invalidClass : ''}`}
              />

              {hasError && <FieldError id={errorId}>{errors[field.name]}</FieldError>}
            </div>
          );
        })}

        <div className="text-left sm:col-span-2">
          <label
            htmlFor="contact-message"
            className="mb-2 block text-left font-['Bebas_Neue'] text-sm uppercase tracking-[0.12em] text-white/70"
          >
            Project details
            <span aria-hidden="true" className="ml-1 text-[#db364e]">
              *
            </span>
          </label>

          <textarea
            id="contact-message"
            ref={(node) => {
              fieldRefs.current.message = node;
            }}
            name="message"
            rows={9}
            value={values.message}
            onChange={(event) => updateField('message', event.target.value)}
            placeholder="Tell us what you are building, the goals, and any deadline."
            aria-invalid={Boolean(errors.message)}
            aria-required="true"
            aria-describedby={errors.message ? 'contact-message-error' : undefined}
            className={`${fieldClass} min-h-36 resize-y text-left ${
              errors.message ? invalidClass : ''
            }`}
          />

          {errors.message && (
            <FieldError id="contact-message-error">{errors.message}</FieldError>
          )}
        </div>
      </div>

      {/* Off-screen rather than display:none, so scrapers still fill it. `inert`
          keeps it out of the tab order and out of the accessibility tree, so its
          <label for> can never drop a real user's focus onto a hidden input. */}
      <div
        inert
        className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"
      >
        <label htmlFor="contact-company">Company website</label>
        <input
          id="contact-company"
          name="_gotcha"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      {formError && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-[#fcd34d]/40 bg-[#fcd34d]/10 px-4 py-2.5 text-base leading-snug text-[#fcd34d]"
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {formError}
        </p>
      )}

      <SpecularButton
        size="md"
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full font-['Bebas_Neue'] uppercase tracking-[0.12em]"
      >
        <span className="inline-flex items-center justify-center gap-2">
          {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {isSubmitting ? 'Sending' : 'Send Inquiry'}
        </span>
      </SpecularButton>
    </motion.form>
  );
}
