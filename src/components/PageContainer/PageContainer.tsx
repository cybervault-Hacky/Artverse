import type { ElementType, ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './PageContainer.module.css'

export type ContainerSize = 'default' | 'wide' | 'narrow'

interface PageContainerProps {
  children: ReactNode
  /** Width of the centred content column. */
  size?: ContainerSize
  /** Removes the side gutters, for edge-to-edge layouts such as the header. */
  flush?: boolean
  /** Rendered element. Defaults to `div`. */
  as?: ElementType
  className?: string
}

/**
 * The single centred content container used by every page, the header and the
 * footer, so horizontal rhythm stays identical across the site.
 */
export function PageContainer({
  children,
  size = 'default',
  flush = false,
  as: Component = 'div',
  className,
}: PageContainerProps) {
  return (
    <Component
      className={cn(styles.container, styles[size], flush && styles.flush, className)}
    >
      {children}
    </Component>
  )
}
