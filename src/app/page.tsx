import Editor from "@/components/Editor";

const HomePage = () => {
  return (
    <div className="grid justify-center">
      <div className="grid grid-rows-[auto_1fr] h-screen w-[65ch] p-4">
        <div className="flex items-center font-medium text-xl p-4">
          <span>📗</span>
          <h3>Notebook AI</h3>
        </div>
        <Editor />
      </div>
    </div>
  );
};

export default HomePage;
