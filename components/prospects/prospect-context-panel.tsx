"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Save,
  User,
  Building2,
  FileText,
  StickyNote,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Prospect, ProspectInput } from "@/lib/types/prospects";

interface ProspectContextPanelProps {
  prospect: Partial<Prospect> | null;
  onProspectCreated: (prospect: Prospect) => void;
  onProspectUpdated: (prospect: Prospect) => void;
  className?: string;
}

function Field({
  label,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cn(
            "w-full resize-none rounded-lg px-3 py-2 text-sm",
            "bg-slate-50 border border-slate-200",
            "text-slate-800 placeholder:text-slate-300",
            "focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-colors"
          )}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-lg px-3 py-2 text-sm",
            "bg-slate-50 border border-slate-200",
            "text-slate-800 placeholder:text-slate-300",
            "focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-colors"
          )}
        />
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  defaultOpen,
  children,
}: {
  icon: typeof User;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-3 text-left group"
      >
        <Icon className="w-3.5 h-3.5 text-blue-500" />
        <span className="text-xs font-medium text-slate-500 flex-1">
          {title}
        </span>
        {open ? (
          <ChevronUp className="w-3 h-3 text-slate-400" />
        ) : (
          <ChevronDown className="w-3 h-3 text-slate-400" />
        )}
      </button>
      {open && <div className="pb-3 space-y-3">{children}</div>}
    </div>
  );
}

export function ProspectContextPanel({
  prospect,
  onProspectCreated,
  onProspectUpdated,
  className,
}: ProspectContextPanelProps) {
  const [form, setForm] = useState<ProspectInput>({
    full_name: prospect?.full_name || "",
    company_name: prospect?.company_name || "",
    email: prospect?.email || "",
    phone: prospect?.phone || "",
    role_title: prospect?.role_title || "",
    industry: prospect?.industry || "",
    company_size: prospect?.company_size || "",
    crm_notes: prospect?.crm_notes || "",
    meeting_notes: prospect?.meeting_notes || "",
    referral_source: prospect?.referral_source || "",
    priority: prospect?.priority || "medium",
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (prospect) {
      setForm({
        full_name: prospect.full_name || "",
        company_name: prospect.company_name || "",
        email: prospect.email || "",
        phone: prospect.phone || "",
        role_title: prospect.role_title || "",
        industry: prospect.industry || "",
        company_size: prospect.company_size || "",
        crm_notes: prospect.crm_notes || "",
        meeting_notes: prospect.meeting_notes || "",
        referral_source: prospect.referral_source || "",
        priority: prospect.priority || "medium",
      });
    }
  }, [prospect]);

  const updateField = useCallback(
    (key: keyof ProspectInput, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setDirty(true);
    },
    []
  );

  const save = useCallback(async () => {
    setSaving(true);
    try {
      if (prospect?.id) {
        const res = await fetch(`/api/prospects/${prospect.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.prospect) {
          onProspectUpdated(data.prospect);
          setDirty(false);
        }
      } else {
        const res = await fetch("/api/prospects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.prospect) {
          onProspectCreated(data.prospect);
          setDirty(false);
        }
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  }, [form, prospect, onProspectCreated, onProspectUpdated]);

  useEffect(() => {
    if (dirty && prospect?.id) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        save();
      }, 2000);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [dirty, prospect?.id, save]);

  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm",
        className
      )}
    >
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">
          {prospect?.id ? "Prospect Context" : "New Prospect"}
        </h3>
        <button
          onClick={save}
          disabled={saving || !dirty}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            dirty
              ? "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
              : "text-slate-400 cursor-default"
          )}
        >
          {saving ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Save className="w-3 h-3" />
          )}
          {saving ? "Saving" : dirty ? "Save" : "Saved"}
        </button>
      </div>

      <div className="px-4 overflow-y-auto max-h-[calc(100vh-14rem)]">
        <Section icon={User} title="Contact Info" defaultOpen>
          <Field label="Full Name" value={form.full_name} onChange={(v) => updateField("full_name", v)} placeholder="Jane Smith" />
          <Field label="Email" value={form.email || ""} onChange={(v) => updateField("email", v)} placeholder="jane@company.com" />
          <Field label="Phone" value={form.phone || ""} onChange={(v) => updateField("phone", v)} placeholder="+1 555-0123" />
          <Field label="Role / Title" value={form.role_title || ""} onChange={(v) => updateField("role_title", v)} placeholder="CEO, Operations Manager, etc." />
        </Section>

        <Section icon={Building2} title="Business Info" defaultOpen>
          <Field label="Company Name" value={form.company_name} onChange={(v) => updateField("company_name", v)} placeholder="Acme Corp" />
          <Field label="Industry" value={form.industry || ""} onChange={(v) => updateField("industry", v)} placeholder="Financial Services, Insurance, etc." />
          <Field label="Company Size" value={form.company_size || ""} onChange={(v) => updateField("company_size", v)} placeholder="5-10, 50-100, 500+, etc." />
          <Field label="Referral Source" value={form.referral_source || ""} onChange={(v) => updateField("referral_source", v)} placeholder="LinkedIn, referral, cold outreach, etc." />
        </Section>

        <Section icon={FileText} title="CRM Notes" defaultOpen>
          <Field label="CRM Notes" value={form.crm_notes || ""} onChange={(v) => updateField("crm_notes", v)} multiline placeholder="Notes from your CRM about this prospect..." />
        </Section>

        <Section icon={StickyNote} title="Meeting Notes" defaultOpen>
          <Field label="Meeting / Call Notes" value={form.meeting_notes || ""} onChange={(v) => updateField("meeting_notes", v)} multiline placeholder="Notes from previous calls, meetings, conversations..." />
        </Section>

        <div className="py-3 space-y-1">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Priority
          </label>
          <div className="flex gap-2">
            {["low", "medium", "high", "urgent"].map((p) => (
              <button
                key={p}
                onClick={() => updateField("priority", p)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  form.priority === p
                    ? p === "urgent"
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : p === "high"
                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
