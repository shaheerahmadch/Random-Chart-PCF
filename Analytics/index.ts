import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { Chart, BarController, BarElement, LinearScale, CategoryScale } from 'chart.js';
import "./style.css";

Chart.register(BarController, BarElement, LinearScale, CategoryScale);


export class Analytics implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _chartCanvas: HTMLCanvasElement;
    private _rows: any;
    private _selectedColumns: Set<string>; // Store selected columns
    private _chart: Chart | null = null; // Add this line

    constructor() {
        this._selectedColumns = new Set<string>();
    }

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this._container = container;
        this._rows = JSON.parse(context.parameters.Items.raw ? context.parameters.Items.raw : "");
        this._container.style.height = `${context.mode.allocatedHeight - 0}px`;
        this._container.style.width = `${context.mode.allocatedWidth - 0}px`;

        // Create a canvas element for rendering charts
        this._chartCanvas = document.createElement("canvas");
        this._chartCanvas.id = "sdsd"
        this._chartCanvas.width = context.mode.allocatedWidth;
        this._chartCanvas.height = context.mode.allocatedHeight;
        this._container.appendChild(this._chartCanvas);

        // Call a function to render random charts based on the dynamic schema data
        this.renderRandomCharts();
    }

    private getRandomColumn(): string {
        // Get a random column name from the available properties in _rows
        //const columns = Object.keys(this._rows);
        const columns = Object.keys(this._rows[0]).filter((col) => col !== 'ID');
        const remainingColumns = columns.filter((col) => !this._selectedColumns.has(col));
        if (remainingColumns.length === 0) {
            // All columns have been mapped; reset the set
            this._selectedColumns.clear();
        }
        const randomIndex = Math.floor(Math.random() * remainingColumns.length);
        const selectedColumn = remainingColumns[randomIndex];
        this._selectedColumns.add(selectedColumn); // Mark as selected
        return selectedColumn;
    }
    private getRandomColor(): string {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgba(${r}, ${g}, ${b}, 0.6)`;
    }

    private renderRandomCharts(): void {
        try {
            this.destroy();
            // Example: Generate random data using a randomly selected column
            const randomColumn = this.getRandomColumn();
            //const labels = Object.keys(this._rows[randomColumn]);
            
            const labels = [...new Set(this._rows.map((row: any) => row[randomColumn]))];
            //const labels = this._rows.map((row: any) => row[randomColumn]);
           // const data = labels;
           
           
           const data = labels.map((label: unknown) => this._rows.filter((row: any) => row[randomColumn] === label as string).length);
           const backgroundColor = this.getRandomColor()
           //const backgroundColor = data.map(() => this.getRandomColor());
           //const data = labels.map((label: string) => this._rows.filter((row: any) => row[randomColumn] === label).length);
            //const data = labels.map((label: string) => this._rows[randomColumn][label]);
            console.log(data)
            // Create a bar chart using Chart.js
            const ctx = this._chartCanvas.getContext("2d") as any;
            if (this._chart) {
                this._chart.destroy(); // Destroy the previous chart if it exists
            }
            this._chart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels,
                    datasets: [
                        {
                            label: `Random Data from ${randomColumn}`,
                            data,
                            backgroundColor,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                },
            });


        } catch (e) {
            console.log(e)
        }
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._rows = JSON.parse(context.parameters.Items.raw ? context.parameters.Items.raw : "");
        // Handle any updates (e.g., if schema data changes)
       // this.renderRandomCharts();
    }

    public getOutputs(): IOutputs {
        return {}; // Return any necessary outputs
    }

    public destroy(): void {
        // Clean up resources if needed
    }
}
