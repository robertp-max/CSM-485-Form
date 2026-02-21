type SkeletonBlockProps = {
  label: string
}

export default function SkeletonBlock({ label }: SkeletonBlockProps) {
  return (
    <div className="skeleton-block" role="status" aria-live="polite" aria-label={label}>
      <span className="skeleton-line" />
      <span className="skeleton-line short" />
    </div>
  )
}
