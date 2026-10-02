interface SectionPlaceholderProps {
  description: string;
}

export function SectionPlaceholder({ description }: SectionPlaceholderProps) {
  return (
    <p className="text-sm leading-relaxed text-mesclar-muted">{description}</p>
  );
}
