import { icons } from "feather-icons";
import { logUnhandledException, PageViewActivity, UITheme } from "typescene";
import { BrowserApplication } from "../src";
import view from "./view";

// add all Feather icons to the current theme
for (let id in icons) {
    UITheme.current.addIcon(id, icons[id].toSvg());
}

/** Main activity for this application */
export class MainActivity extends PageViewActivity.with(
    {
        name: "Home",
        path: "",
        view
    }
) {
    text = "Hello, world";

    /** Do something useful here */
    async foo() {
        let result = await this.showConfirmationDialogAsync(
            "Are the cows coming home yet?",
            "It’s been a while...",
            "Yes, they are", "No, not yet");
        if (!result) {
            this.showConfirmationDialogAsync("Please write some more code.");
        }
    }
}

/** The application class itself */
class Application extends BrowserApplication.with(
    // add all root activities here
    MainActivity
) {
    async onManagedStateActivatingAsync() {
        await super.onManagedStateActivatingAsync();
        // ... add pre-initialization code here
    }

    async onManagedStateActiveAsync() {
        await super.onManagedStateActiveAsync();
        // ... add post-initialization code here
    }
}

// create the application with the main activity defined above
let app = (window as any).app = new Application();
app.activateAsync().catch(logUnhandledException);
