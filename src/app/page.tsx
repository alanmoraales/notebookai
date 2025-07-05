import Editor from "@/components/Editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const HomePage = () => {
  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <aside>
            <h4>Files</h4>
          </aside>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <main className="*:@container *:h-full h-full *:grid *:justify-center">
            <Editor />
          </main>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <aside>
            <h4>Chat</h4>
          </aside>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default HomePage;
