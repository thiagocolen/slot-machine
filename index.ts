import './my-icon';

// Import stylesheets
import './style.css';

import { CONFIG } from './config';

export interface Reel {
  slotNumber: number;
  symbolList: Array<any>;
}

export class SlotMachine {
  // Elements
  public container: Element;
  public reel_animations: Animation[] = [];
  public spinButton: Element;
  public previous_reel: Array<Reel> = [];

  // Status
  public finished_reels: number = 0;
  public result: any[] = [];

  constructor() {
    this.initPreviousReelObj();
    this.createSlotMachine(CONFIG.SLOT_MACHINE_SIZE);
    this.createSpinButton();
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
    this.spinButton = document.getElementById('spinButton');
    this.spinButton.addEventListener('click', () => this.spin());
  }

  createSlotMachine(size: number) {
    this.container = document.getElementById('container');
    this.container.setAttribute('class', 'slot-machine');
    this.container.setAttribute('style', `width: ${200 * size}px`);
    this.container.innerHTML = null;

    const center_line_element = document.createElement('div');
    center_line_element.setAttribute('class', 'center-line');

    this.container.appendChild(center_line_element);

    this.reel_animations = [];
    for (let i = 0; i < size; i++) {
      this.reel_animations.push(this.createReel(i));
    }
  }

  createReel(i: number): Animation {
    const reel: HTMLDivElement = document.createElement('div');
    reel.setAttribute('class', 'reel');
    reel.setAttribute('id', `slot_${i}`);

    for (let i = 0; i <= CONFIG.REEL_SIZE; i++) {
      const randomIndex = Math.floor(Math.random() * CONFIG.CARD_SUITS.length);
      const symbolHtml = `
        <div class="symbol" id="${i}">${CONFIG.CARD_SUITS[randomIndex]}</div>
        `;
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
              .item(reel.children.length - CONFIG.REEL_OFFSET - 1)
              .cloneNode(true),
            reel.children
              .item(reel.children.length - CONFIG.REEL_OFFSET)
              .cloneNode(true),
            reel.children
              .item(reel.children.length - CONFIG.REEL_OFFSET + 1)
              .cloneNode(true)
          );
        } else {
          reel.prepend(...item.symbolList);
        }
        //
        item.symbolList = [];
        //
        item.symbolList.push(
          reel.children.item(reel.children.length - CONFIG.REEL_OFFSET - 1),
          reel.children.item(reel.children.length - CONFIG.REEL_OFFSET),
          reel.children.item(reel.children.length - CONFIG.REEL_OFFSET + 1)
        );
      }
    });
  }

  createReelAnimation(slot: Element): Animation {
    const symbolHeight =
      document.getElementsByClassName('symbol')[0].clientHeight;

    const frame = [
      { transform: 'translateY(0)' },
      {
        transform: `translateY(-${slot.clientHeight - symbolHeight * 4}px)`,
      },
    ];

    const keyframeAnimationOptions: KeyframeAnimationOptions = {
      delay: Math.floor(Math.random() * CONFIG.ANIMATION_DELAY),
      duration: CONFIG.ANIMATION_DURATION,
      // https://cubic-bezier.com/#.52,.08,.45,1.19
      easing: 'cubic-bezier(.52,.08,.45,1.19)',
      iterations: 1,
      direction: 'normal',
      fill: 'forwards',
    };

    const animation: Animation = slot.animate(frame, keyframeAnimationOptions);
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
    this.createSlotMachine(CONFIG.SLOT_MACHINE_SIZE);

    this.reel_animations.forEach((animation: Animation) => {
      animation.play();
    });
  }

  getResult(): void {
    this.result = [];

    for (let i = 0; i < CONFIG.SLOT_MACHINE_SIZE; i++) {
      const offset =
        document.getElementById(`slot_${i}`).children.length -
        CONFIG.REEL_OFFSET;

      this.result.push(
        document.getElementById(`slot_${i}`).children[offset].innerHTML
      );
    }

    const result = this.result.reduce((previous, current) => {
      if (previous === current) return current;
      return CONFIG.NO_CARD_SUIT;
    });

    if (result === CONFIG.NO_CARD_SUIT) {
      this.showLost();
    } else {
      this.showWin();
    }
  }

  showLost() {
    console.log('Parabéns, você tomou no cú!');
    console.log('-----------------------------------------');
  }

  showWin() {
    console.log('Parabéns, você ganhou! ...nada');
    console.log('-----------------------------------------');
  }
}

new SlotMachine();
