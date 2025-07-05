import Editor from "@/components/Editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";

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
          <ScrollArea className="h-screen">
            <main className="*:@container *:h-full h-screen *:grid *:justify-center">
              <Editor />
            </main>
          </ScrollArea>
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
