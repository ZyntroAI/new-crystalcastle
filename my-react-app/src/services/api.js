export async function getHello() {
  const res = await fetch("http://localhost:8000/api/hello");
  return res.json();
}