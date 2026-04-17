type Props = {
  errors: Record<string, string[] | string> | null;
};

export default function FieldErrors({ errors }: Props) {
  if (!errors) {
    return null;
  }

  const entries = Object.entries(errors);
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-semibold">Vui lòng kiểm tra lại dữ liệu:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {entries.map(([field, value]) => {
          const messages = Array.isArray(value) ? value : [value];
          return (
            <li key={field}>
              <span className="font-semibold">{field}</span>: {messages.join(", ")}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
