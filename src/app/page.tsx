import Editor from "@/components/Editor";

const HomePage = () => {
  return (
    <div className="grid grid-cols-[1fr] h-screen">
      <aside className="hidden">
        <h4>Files</h4>
      </aside>
      <main className="*:h-full">
        <Editor />
      </main>
      <aside className="hidden">
        <h4>Chat</h4>
      </aside>
    </div>
  );
};

export default HomePage;
