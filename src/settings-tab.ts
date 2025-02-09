import {
    App,
    PluginSettingTab,
    normalizePath,
    Setting
} from 'obsidian';
import {DayPlannerMode} from './settings';
import type DayPlanner from './main';
import {ICONS} from './constants';
import {FileSuggest, FileSuggestMode, FolderSuggest} from './file-suggester'

export class DayPlannerSettingsTab extends PluginSettingTab {
    plugin: DayPlanner;
    error: string;

    constructor(app: App, plugin: DayPlanner) {
        super(app, plugin);
        this.plugin = plugin;
    }

    clearError() {
        this.error = "";
    }

    validateFolder(folder: string): string {
        if (!folder || folder === "/") {
            return "";
        }

        const {vault} = window.app;
        if (!vault.getAbstractFileByPath(normalizePath(folder))) {
            return "Folder not found in vault";
        }

        return "";
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('Day Planner Mode')
            .setDesc(this.modeDescriptionContent())
            .addDropdown(dropDown =>
                dropDown
                    .addOption(DayPlannerMode[DayPlannerMode.File], "File mode")
                    .addOption(DayPlannerMode[DayPlannerMode.Command], "Command mode")
                    .setValue(DayPlannerMode[this.plugin.settings.mode] || DayPlannerMode.File.toString())
                    .onChange((value: string) => {
                        this.plugin.settings.mode = DayPlannerMode[value as keyof typeof DayPlannerMode];
                        this.plugin.saveData(this.plugin.settings);
                    }));

        new Setting(containerEl)
            .setName('Day Planner Template')
            .addSearch((cb) => {
                new FileSuggest(
                    this.app,
                    cb.inputEl,
                    this.plugin,
                    FileSuggestMode.TemplateFiles
                );

                cb.setPlaceholder("Template")
                    .setValue(this.plugin.settings.noteTemplate)
                    .onChange((value: string) => {
                        this.plugin.settings.noteTemplate = value
                        this.plugin.saveData(this.plugin.settings);
                    })

                containerEl.addClass("day-planner-search");
            })
            .setDesc('Choose the file to use as a template.');

        new Setting(containerEl)
            .setName('Planner Folder')
            .addSearch((cb) => {
                new FolderSuggest(
                    this.app,
                    cb.inputEl
                );

                cb.setPlaceholder("Folder")
                    .setValue(this.plugin.settings.customFolder)
                    .onChange((value: string) => {
                        this.error = this.validateFolder(value)
                        this.plugin.settings.customFolder = value
                        this.plugin.saveData(this.plugin.settings);
                    })

                containerEl.addClass("day-planner-search");
            })
            .setDesc('Folder where auto-created notes will be saved');

        new Setting(containerEl)
            .setName('Custom File Prefix')
            .setDesc('The prefix for your planner note file names')
            .addText(component =>
                component
                    .setValue(this.plugin.settings.fileNamePrefix ?? "Day Planner-")
                    .onChange((value: string) => {
                        this.plugin.settings.fileNamePrefix = value
                        this.plugin.saveData(this.plugin.settings);
                    }));

        new Setting(containerEl)
            .setName('File name Date Format')
            .setDesc('The date format for your planner note file names')
            .addDropdown(dropdown => {
                dropdown.addOption('MM-DD-YYYY', 'MM-DD-YYYY')
                dropdown.addOption('DD-MM-YYYY', 'DD-MM-YYYY')
                dropdown.addOption('YYYYMMDD', 'YYYYMMDD')
                return dropdown
                    .setValue(this.plugin.settings.fileNameDateFormat ?? 'YYYMMDD')
                    .onChange((value: string) => {
                        this.plugin.settings.fileNameDateFormat = value;
                        this.plugin.saveData(this.plugin.settings);
                    })
            });


        new Setting(containerEl)
            .setName('Complete past planner items')
            .setDesc('The plugin will automatically mark checkboxes for tasks and breaks in the past as complete')
            .addToggle(toggle =>
                toggle
                    .setValue(this.plugin.settings.completePastItems)
                    .onChange((value: boolean) => {
                        this.plugin.settings.completePastItems = value;
                        this.plugin.saveData(this.plugin.settings);
                    }));

        new Setting(containerEl)
            .setName('Mermaid Gantt')
            .setDesc('Include a mermaid gantt chart generated for the day planner')
            .addToggle(toggle =>
                toggle
                    .setValue(this.plugin.settings.mermaid)
                    .onChange((value: boolean) => {
                        this.plugin.settings.mermaid = value;
                        this.plugin.saveData(this.plugin.settings);
                    }));

        new Setting(containerEl)
            .setName('Status Bar - Circular Progress')
            .setDesc('Display a circular progress bar in the status bar')
            .addToggle(toggle =>
                toggle
                    .setValue(this.plugin.settings.circularProgress)
                    .onChange((value: boolean) => {
                        this.plugin.settings.circularProgress = value;
                        this.plugin.saveData(this.plugin.settings);
                    }));

        new Setting(containerEl)
            .setName('Status Bar - Now and Next')
            .setDesc('Display now and next tasks in the status bar')
            .addToggle(toggle =>
                toggle
                    .setValue(this.plugin.settings.nowAndNextInStatusBar)
                    .onChange((value: boolean) => {
                        this.plugin.settings.nowAndNextInStatusBar = value;
                        this.plugin.saveData(this.plugin.settings);
                    }));

        new Setting(containerEl)
            .setName('Task Notification')
            .setDesc('Display a notification when a new task is started')
            .addToggle(toggle =>
                toggle
                    .setValue(this.plugin.settings.showTaskNotification)
                    .onChange((value: boolean) => {
                        this.plugin.settings.showTaskNotification = value;
                        this.plugin.saveData(this.plugin.settings);
                    }));

        new Setting(containerEl)
            .setName('Timeline Zoom Level')
            .setDesc('The zoom level to display the timeline. The higher the number, the more vertical space each task will take up.')
            .addSlider(slider =>
                slider
                    .setLimits(1, 5, 1)
                    .setValue(this.plugin.settings.timelineZoomLevel ?? 4)
                    .setDynamicTooltip()
                    .onChange((value: number) => {
                        this.plugin.settings.timelineZoomLevel = value;
                        this.plugin.saveData(this.plugin.settings);
                    }));

        new Setting(containerEl)
            .setName('Timeline Icon')
            .setDesc('The icon of the timeline pane. Reopen timeline pane or restart obsidian to see the change.')
            .addDropdown(dropdown => {
                ICONS.forEach(icon => dropdown.addOption(icon, icon));
                return dropdown
                    .setValue(this.plugin.settings.timelineIcon ?? 'calendar-with-checkmark')
                    .onChange((value: string) => {
                        this.plugin.settings.timelineIcon = value;
                        this.plugin.saveData(this.plugin.settings);
                    });
            });

        new Setting(containerEl)
            .setName('BREAK task label')
            .setDesc('Use this label to mark break between tasks.')
            .addText(component =>
                component
                    .setValue(this.plugin.settings.breakLabel ?? "BREAK")
                    .onChange((value: string) => {
                        this.plugin.settings.breakLabel = value
                        this.plugin.saveData(this.plugin.settings);
                    }));

        new Setting(containerEl)
            .setName('END task label')
            .setDesc('Use this label to mark the end of all tasks.')
            .addText(component =>
                component
                    .setValue(this.plugin.settings.endLabel ?? "END")
                    .onChange((value: string) => {
                        this.plugin.settings.endLabel = value
                        this.plugin.saveData(this.plugin.settings);
                    }));
    }

    private modeDescriptionContent(): DocumentFragment {
        const descEl = document.createDocumentFragment();
        descEl.appendText('Choose between 2 modes to use the Day Planner plugin:');
        descEl.appendChild(document.createElement('br'));
        descEl.appendChild(document.createElement('strong')).appendText('File mode');
        descEl.appendChild(document.createElement('br'));
        descEl.appendText('Plugin automatically generates day planner notes for each day within a Day Planners folder.');
        descEl.appendChild(document.createElement('br'));
        descEl.appendChild(document.createElement('strong')).appendText('Command mode');
        descEl.appendChild(document.createElement('br'));
        descEl.appendText('Command used to insert a Day Planner for today within the current note.');
        descEl.appendChild(document.createElement('br'));
        this.addDocsLink(descEl);
        return descEl;
    }

    private addDocsLink(descEl: DocumentFragment) {
        const a = document.createElement('a');
        a.href = 'https://github.com/lynchjames/obsidian-day-planner/blob/main/README.md';
        a.text = 'plugin README';
        a.target = '_blank';
        descEl.appendChild(a);
        descEl.appendChild(document.createElement('br'));
    }

}
