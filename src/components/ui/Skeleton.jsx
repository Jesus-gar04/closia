import clsx from 'clsx'

export function Skeleton({ className }) {
  return <div className={clsx('skeleton rounded-md', className)} />
}

export function SkeletonTarjeta() {
  return (
    <div className="bg-surface rounded-lg overflow-hidden border border-hairline">
      <Skeleton className="aspect-square" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2.5 w-1/2" />
      </div>
    </div>
  )
}
