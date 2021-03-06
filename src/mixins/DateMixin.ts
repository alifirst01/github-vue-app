import Vue from "vue"
import Component from "vue-class-component"

@Component
export default class DateMixin extends Vue {
    timeDiff:string = ""
    lastUpdated:Date = new Date()

    /**
     * Update the string timeDiff using the last updated date&time and the current date&time
     */
    updateTimeDiff() {
        var seconds = Math.floor((<any>new Date() - <any>this.lastUpdated) / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        if(hours > 0)
            this.timeDiff = hours.toString() + ((hours == 1) ? " hr " : " hrs ") + "ago";
        else if(minutes > 0)
            this.timeDiff = minutes.toString() + ((minutes == 1) ? " min " : " mins ") + "ago";        
        else
            this.timeDiff = "now";
    }
}