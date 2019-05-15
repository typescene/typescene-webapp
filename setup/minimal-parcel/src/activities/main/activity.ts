import { PageViewActivity } from "typescene";
import view from "./view";

export class MainActivity extends PageViewActivity.with(view) {
    path = "/";

    async onManagedStateActiveAsync() {
        await super.onManagedStateActiveAsync();
        console.log("MainActivity is now active");
    }
}
