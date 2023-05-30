import { LitElement, html, css, customElement, property } from 'lit-element';

@customElement('my-icon')
export class MyElement extends LitElement {
  static styles = css`
    p {
      color: red;
      font-weight: bold;
    }  
  `;

  render() {
    return html`<p>TESTE</p>`;
  }
}
