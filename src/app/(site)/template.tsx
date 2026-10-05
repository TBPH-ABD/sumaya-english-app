// A template re-mounts on every navigation, so each page plays its entrance.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="anim-rise">{children}</div>;
}
