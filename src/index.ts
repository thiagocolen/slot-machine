import "./style.css";
import { CONFIG } from "./config";

// Create an AudioContext instance
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

interface AudioTrack {
    name: string;
    htmlMediaElement: HTMLMediaElement;
    mediaElementAudioSourceNode: MediaElementAudioSourceNode;
}

class SlotAudioMachine {
    private audioCtx!: AudioContext;
    private gainNode!: GainNode;
    private trackList!: AudioTrack[];

    constructor(audioCtx: AudioContext) {
        this.audioCtx = audioCtx;
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.connect(audioCtx.destination);
        this.gainNode.gain.value = 0.125;
        this.trackList = this.loadTracks();
    }

    public loadTracks(): AudioTrack[] {
        const trackIdList = document.querySelectorAll("audio");

        const trackList: AudioTrack[] = [];

        trackIdList.forEach((track) => {
            const htmlMediaElement = document.querySelector(
                `#${track.id}`
            ) as HTMLMediaElement;
            const mediaElementAudioSourceNode =
                this.audioCtx.createMediaElementSource(htmlMediaElement);
            mediaElementAudioSourceNode.connect(this.gainNode);

            trackList.push({
                name: track.id,
                htmlMediaElement: htmlMediaElement,
                mediaElementAudioSourceNode: mediaElementAudioSourceNode,
            });
        });

        return trackList;
    }

    public async playTrack(trackId: string): Promise<any> {
        this.trackList.forEach((track) => {
            if (track.name === trackId) {
                track.htmlMediaElement.play();
            }
        });
    }
}

// --------------------------------------------------------------

interface Reel {
    slotNumber: number;
    symbolList: Array<any>;
}

class SlotMachine {
    // Elements
    public container!: Element;
    public reel_animations: Animation[] = [];
    public spinButton!: Element;
    public previous_reel: Array<Reel> = [];

    // Status
    public finished_reels: number = 0;
    public result: any[] = [];

    // Audio FX
    public audioMachine: SlotAudioMachine = new SlotAudioMachine(audioCtx);


    //
    public score: number = 0;
    public betValue: number = 10;

    constructor() {
        this.initPreviousReelObj();
        this.createSlotMachine(CONFIG.SLOT_MACHINE_SIZE);
        this.createSpinButton();

        this.getScore();
        this.changeScore(0);

    }

    initPreviousReelObj() {
        for (let i = 0; i < CONFIG.SLOT_MACHINE_SIZE; i++) {
            this.previous_reel.push({
                slotNumber: i,
                symbolList: [],
            });
        }
    }

    createSpinButton() {
        this.spinButton = document.getElementsByClassName("spin-button")[0];
        this.spinButton.addEventListener("click", () => {
            this.spinButton.setAttribute(
                "class",
                "spin-button spin-button-clicked"
            );

            setTimeout(() => {
                this.spinButton.setAttribute("class", "spin-button");
            }, CONFIG.SPIN_BUTTON_DELAY);

            this.spin();
        });
    }

    createSlotMachine(size: number) {
        this.container = document.getElementsByClassName("slot-machine")[0];
        this.container.innerHTML = "";

        this.reel_animations = [];
        for (let i = 0; i < size; i++) {
            this.reel_animations.push(this.createReel(i));
        }
    }

    createReel(i: number): Animation {
        const reel: HTMLDivElement = document.createElement("div");
        reel.setAttribute("class", "reel");
        reel.setAttribute("id", `slot_${i}`);

        for (let i = 0; i <= CONFIG.REEL_SIZE; i++) {
            const randomIndex = Math.floor(Math.random() * CONFIG.SYMBOL_QTY);
            const symbolHtml = `<div class="symbol symbol_${randomIndex}" id="${randomIndex}"></div>`;
            reel.innerHTML = reel.innerHTML + symbolHtml;
        }

        this.previousReelChange(i, reel);
        this.container.appendChild(reel);
        return this.createReelAnimation(reel);
    }

    previousReelChange(i: number, reel: HTMLDivElement) {
        this.previous_reel.forEach((item) => {
            if (item.slotNumber === i) {
                //
                if (item.symbolList.length === 0) {
                    reel.prepend(
                        reel.children
                            .item(
                                reel.children.length - CONFIG.REEL_OFFSET - 1
                            )!
                            .cloneNode(true),
                        reel.children
                            .item(reel.children.length - CONFIG.REEL_OFFSET)!
                            .cloneNode(true),
                        reel.children
                            .item(
                                reel.children.length - CONFIG.REEL_OFFSET + 1
                            )!
                            .cloneNode(true)
                    );
                } else {
                    reel.prepend(...item.symbolList);
                }
                //
                item.symbolList = [];
                //
                item.symbolList.push(
                    reel.children.item(
                        reel.children.length - CONFIG.REEL_OFFSET - 1
                    ),
                    reel.children.item(
                        reel.children.length - CONFIG.REEL_OFFSET
                    ),
                    reel.children.item(
                        reel.children.length - CONFIG.REEL_OFFSET + 1
                    )
                );
            }
        });
    }

    createReelAnimation(slot: Element): Animation {
        const symbolHeight =
            document.getElementsByClassName("symbol")[0].clientHeight;

        const frame = [
            { transform: "translateY(0)" },
            {
                transform: `translateY(-${
                    slot.clientHeight - symbolHeight * 4
                }px)`,
            },
        ];

        const keyframeAnimationOptions: KeyframeAnimationOptions = {
            delay: Math.floor(Math.random() * CONFIG.ANIMATION_DELAY),
            duration: CONFIG.ANIMATION_DURATION,
            // https://cubic-bezier.com/#.52,.08,.45,1.19
            easing: "cubic-bezier(.52,.08,.45,1.19)",
            iterations: 1,
            direction: "normal",
            fill: "forwards",
        };

        const animation: Animation = slot.animate(
            frame,
            keyframeAnimationOptions
        );
        animation.cancel();
        animation.onfinish = () => {
            this.finished_reels = this.finished_reels + 1;
            if (this.finished_reels === CONFIG.SLOT_MACHINE_SIZE) {
                this.getResult();
                this.finished_reels = 0;
            }
        };

        return animation;
    }

    spin(): void {

        this.changeScore(-this.betValue);

        this.createSlotMachine(CONFIG.SLOT_MACHINE_SIZE);

        setTimeout(() => {
            this.audioMachine.playTrack("audio_wheel");
        }, CONFIG.SPIN_BUTTON_DELAY);

        this.reel_animations.forEach((animation: Animation) => {
            animation.play();
        });
    }

    getResult(): void {
        this.result = [];

        for (let i = 0; i < CONFIG.SLOT_MACHINE_SIZE; i++) {
            const offset =
                document.getElementById(`slot_${i}`)!.children.length -
                CONFIG.REEL_OFFSET;

            this.result.push(
                document
                    .getElementById(`slot_${i}`)!
                    .children[offset].getAttribute("id")
            );
        }

        this.checkResult(this.result);
    }

    checkResult(result: string[]): void {
        const uniqueValues = Array.from(new Set(result));

        console.log(uniqueValues);

        if (uniqueValues.length === 1) {
            if (uniqueValues[0] === "1") {
                this.changeScore(1000);
            }

            if (uniqueValues[0] === "3") {
                this.changeScore(80);
            }

            if (uniqueValues[0] === "2") {
                this.changeScore(40);
            }

            if (uniqueValues[0] === "0") {
                this.changeScore(20);
            }

        } else if (uniqueValues.length === 2) {
            let cherryQty = 0;
            result.forEach((val) => {
                if (val === '2') {
                    cherryQty++;
                }
            });

            if (cherryQty === 1) {
                this.changeScore(5);
            } else if (cherryQty === 2) {
                this.changeScore(2);
            } else {
                this.changeScore(0);
            }

        } else {
            let hasCherry = false;
            uniqueValues.forEach((val) => {
                if (val === "2") {
                    hasCherry = true;
                }
            });

            if (hasCherry) {
                this.changeScore(2);
            } else {
                this.changeScore(0);
            }
        }
    }


    private getScore() {
        const score = localStorage.getItem("slot-machine-score");

        if (score ===  null) {
            localStorage.setItem("slot-machine-score", '100');
            this.getScore();
        } else {
            this.score = Number(score);
        }


    }

    private changeScore(times: number) {
        this.score = this.score + (times * this.betValue);
        console.log('score:', this.score, ' x:', times);

        localStorage.setItem("slot-machine-score", this.score.toString());

        const scoreDisplay: Element = document.getElementsByClassName('score')[0];    
        scoreDisplay.innerHTML = `$ ${this.score.toString()}`;
    
    }
}

const sm = new SlotMachine();
