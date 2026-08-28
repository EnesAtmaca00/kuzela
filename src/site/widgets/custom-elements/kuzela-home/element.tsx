import '../../../../public/kuzelaHome.js';

const KuzelaHome = customElements.get('kuzela-home');

if (!KuzelaHome) {
  throw new Error('kuzela-home custom element was not registered.');
}

export default KuzelaHome;
