export abstract class MapGeneratorBase {

    private readonly generatorThread: LuaThread;
    
    private debt: number = 0;
    private maxDebt: number = 300;
    private isPaused: boolean = true;

    public progress: number = 0;
    public isDone: boolean = false;
    
    constructor() {
        this.generatorThread = coroutine.create(() => this.generateMap());
    }

    protected abstract generateMap(): void;

    public resume() {
        if (this.isPaused) this.debt = 0;
        coroutine.resume(this.generatorThread);
    }

    public pause() {
        this.isPaused = true;
        coroutine.yield();
    }
}