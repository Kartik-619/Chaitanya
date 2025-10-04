import Hero from "../component/hero";
import Sidebar from "../component/navbar";

export default function Home() {
  return (
    <>
      <Hero />
      <div style={{ height: "150vh", backgroundColor: "#0a0a0a" }}></div>
      <div style={{ height: "150vh", backgroundColor: "#222" }}></div>
    </>
  );
}
