// src/components/ui/alert-dialog.jsx
//  ─── “cascarones” mínimos de TODOS los sub-componentes ───
export function AlertDialog({ children }) {
  return <>{children}</>;
}

export function AlertDialogTrigger({ children, ...props }) {
  return <button {...props}>{children}</button>;
}

export function AlertDialogContent({ children, ...props }) {
  return <div {...props}>{children}</div>;
}

export function AlertDialogHeader({ children, ...props }) {
  return <header {...props}>{children}</header>;
}

export function AlertDialogTitle({ children, ...props }) {
  return <h2 {...props}>{children}</h2>;
}

export function AlertDialogDescription({ children, ...props }) {
  return <p {...props}>{children}</p>;
}

export function AlertDialogAction({ children, ...props }) {
  return <button {...props}>{children}</button>;
}

export function AlertDialogCancel({ children, ...props }) {
  return <button {...props}>{children}</button>;
}

export function AlertDialogFooter({ children, ...props }) {
  return <footer {...props}>{children}</footer>;
}

export function AlertDialogOverlay({ children, ...props }) {
  // Generalmente es un fondo semitransparente
  return <div {...props}>{children}</div>;
}
