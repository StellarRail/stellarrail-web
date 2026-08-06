import * as React from 'react'
export function TableWrap({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}
export default TableWrap
