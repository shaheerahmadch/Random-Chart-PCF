import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';
import "./style.css";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);

export class Analytics implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _chartCanvas: HTMLCanvasElement;
    private _rows: any;
    private _randomColumn: any;
    private _selectedColumns: Set<string>;
    private _chart: Chart | null = null;

    constructor() {
        this._selectedColumns = new Set<string>();
    }

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this._container = container;
        this._rows = JSON.parse(context.parameters.Items.raw ? context.parameters.Items.raw : "");
        this._container.style.height = `${context.mode.allocatedHeight - 0}px`;
        this._container.style.width = `${context.mode.allocatedWidth - 0}px`;

        this._chartCanvas = document.createElement("canvas");
        this._chartCanvas.id = "chartCanvas";
        this._chartCanvas.width = context.mode.allocatedWidth;
        this._chartCanvas.height = context.mode.allocatedHeight;
        this._container.appendChild(this._chartCanvas);

        this.renderRandomCharts(notifyOutputChanged);
    }

    private getRandomColumn(): string {
        const columns = Object.keys(this._rows[0]).filter((col) => col !== 'ID');
        const remainingColumns = columns.filter((col) => !this._selectedColumns.has(col));

        if (remainingColumns.length === 0) {
            this._selectedColumns.clear();
        }

        const randomIndex = Math.floor(Math.random() * remainingColumns.length);
        const selectedColumn = remainingColumns[randomIndex];
        this._selectedColumns.add(selectedColumn);
        return selectedColumn;
    }

    private getRandomColor(): string {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgba(${r}, ${g}, ${b}, 0.6)`;
    }

    private renderRandomCharts(notifyOutputChanged: () => void): void {
        try {
            this.destroy();

            const randomColumn = this.getRandomColumn();
            this._randomColumn = randomColumn;
            notifyOutputChanged();

            const labels = [...new Set(this._rows.map((row: any) => row[randomColumn]))];
            const data = labels.map((label: unknown) => this._rows.filter((row: any) => row[randomColumn] === label as string).length);

            const ctx = this._chartCanvas.getContext("2d") as any;
            if (this._chart) {
                this._chart.destroy();
            }

            this._chart = new Chart(ctx, {
                type: "line", // Changed to 'line'
                data: {
                    labels,
                    datasets: [
                        {
                            label: `Random Data from ${randomColumn}`,
                            data,
                            backgroundColor: this.getRandomColor(),
                            borderColor: this.getRandomColor(), // Added border color for line chart
                            fill: false, // Ensure the line chart is not filled
                            tension: 0.1, // Smoothing for the line
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
            console.log(e);
        }
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._rows = JSON.parse(context.parameters.Items.raw ? context.parameters.Items.raw : "");
    }

    public getOutputs(): IOutputs {
        return {
            RandomColumn: this._randomColumn
        };
    }

    public destroy(): void {
        if (this._chart) {
            this._chart.destroy();
        }
    }
}
