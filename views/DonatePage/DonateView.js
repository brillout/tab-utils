import React from 'react';
import './style.css';
import romuald_alps from "./romuald_alps.png";
import {tab_app_name} from '../../../tab_app_info';

export default DonateView;

function DonateView() {
  return <>
    <img id="rom-face" src={romuald_alps} />

    <h1>
    Hello,
    </h1>

    <p>
    I'm Romuald, the creator of {tab_app_name}
    </p>

    <p>
    For the longest time, I refused to put ads on {tab_app_name}. I don't like ads.
    </p>

    <p>
    But ads and donations allow me to dedicate myself to {tab_app_name} and
    I've got many ideas for improvements and entirely new features!
    </p>

    <p>
    If you donate, I will give you a hidden code to remove ads.
    </p>

    <p>
    In order to donate, make a PayPal wire to the following PayPal email:
    </p>
    <p style={{paddingLeft: 20}}>
      <b id='paypal-email'></b>
    </p>

    <p>
    Any amount you are capable of donating is welcome.
    You can PayPal me only 0.01$ if you are short on money, it's totally fine.
    </p>

    <p>
    You will receive an automatic email containing the ad removal code instantly after your PayPal wire.
    </p>

    <p>
    I'm looking forward to a bright {tab_app_name} future :-).
    </p>

    <p>
    Yours sincerely,
    </p>

    <p>
    Romuald<br/>
    <a target='_blank' className="contact-address"></a>
    </p>

    <p>
    P.S. Thank you for your lovely messages attached to your PayPal wires, I'm glad people enjoy what I'm building.
    </p>
  </>;
}
