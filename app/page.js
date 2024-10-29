import Form from "./(sections)/Form";
import RepositoryDisplay from "./(sections)/RepositoryDisplay";

export default function Home() {
  return (
    <>
      <main className="flex flex-col items-center justify-center px-4 sm:px-20 py-10  min-h-screen text-white content-container">
        <h1 className="text-4xl font-bold text-center text-[#00D1B2]">Advanced WebScrapper Project</h1>
        <Form />
      </main>
    </>
  );
}
