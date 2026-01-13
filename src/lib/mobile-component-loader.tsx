import dynamic, { DynamicOptionsLoadingProps } from "next/dynamic"
import { ComponentType } from "react"

/**
 * モバイルコンポーネント用のローディング表示
 */
export function MobileComponentLoader({ isLoading }: DynamicOptionsLoadingProps) {
  if (!isLoading) return null
  
  return (
    <div className="flex items-center justify-center py-4">
      <div className="animate-pulse flex space-x-2">
        <div className="h-2 w-2 bg-white/60 rounded-full" />
        <div className="h-2 w-2 bg-white/60 rounded-full" style={{ animationDelay: "0.2s" }} />
        <div className="h-2 w-2 bg-white/60 rounded-full" style={{ animationDelay: "0.4s" }} />
      </div>
    </div>
  )
}

/**
 * モバイルコンポーネントを動的に読み込むためのヘルパー関数
 * 
 * @template T - コンポーネントのprops型
 * @param importPath - コンポーネントのインポートパス
 * @param options - 動的インポートのオプション
 * @returns 動的に読み込まれるコンポーネント
 * 
 * @example
 * ```tsx
 * const MobileAbout = createMobileComponent<{ daysUntilBirthday: number }>(
 *   "../components/mobile-about"
 * )
 * ```
 */
export function createMobileComponent<T = Record<string, never>>(
  importPath: string,
  options?: {
    loading?: (props: DynamicOptionsLoadingProps) => JSX.Element | null
  }
) {
  return dynamic<T>(
    () => import(importPath),
    {
      ssr: false,
      loading: options?.loading || MobileComponentLoader,
    }
  )
}
