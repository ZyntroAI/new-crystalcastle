import { tokens } from "../design/tokens";

export function Card({ title }: { title: string }) {
  return <div style={{ color: tokens.color.text }}>{title}</div>;
}
