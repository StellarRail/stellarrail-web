import * as React from 'react'
export function DialogShim({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <>{children}</>
}
export default DialogShim
