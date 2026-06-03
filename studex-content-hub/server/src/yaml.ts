function scalar(value: unknown) {
  if (value === null) return "null";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  const text = String(value);
  return /[:#\-\n]/.test(text) ? JSON.stringify(text) : text;
}

function stringifyValue(value: unknown, indent: number): string {
  const space = " ".repeat(indent);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value
      .map((entry) => {
        if (entry && typeof entry === "object") {
          return `${space}-\n${stringifyObject(entry as Record<string, unknown>, indent + 2)}`;
        }
        return `${space}- ${scalar(entry)}`;
      })
      .join("\n");
  }

  if (value && typeof value === "object") {
    return stringifyObject(value as Record<string, unknown>, indent);
  }

  return `${space}${scalar(value)}`;
}

function stringifyObject(value: Record<string, unknown>, indent: number): string {
  const space = " ".repeat(indent);
  return Object.entries(value)
    .map(([key, entry]) => {
      if (entry && typeof entry === "object") {
        return `${space}${key}:\n${stringifyValue(entry, indent + 2)}`;
      }
      return `${space}${key}: ${scalar(entry)}`;
    })
    .join("\n");
}

export function toYaml(value: Record<string, unknown>) {
  return `${stringifyObject(value, 0)}\n`;
}
