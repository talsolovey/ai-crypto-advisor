export default function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <h2 style={{ marginTop: 0 }}>{props.title}</h2>
      {props.children}
    </section>
  );
}
