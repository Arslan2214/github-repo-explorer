import Form from "./(sections)/Form";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <main className="flex flex-col items-center justify-center px-4 sm:px-20 py-10 text-white content-container min-h-[calc(100vh-30px)]">
        <h1 className="text-4xl font-bold text-center text-[#00D1B2]">Advanced WebScrapper Project</h1>
        <Form />
      </main>
      <footer className="h-[30px] flex justify-center gap-1 items-center"> 
        Created By <Link taget="_blank" href="https://github.com/Arslan2214" className="text-[#00D1B2] font-bold hover:underline underline-offset-2">ARslan&nbsp;Ahmad</Link> 😎
      </footer>
    </>
  );
}
