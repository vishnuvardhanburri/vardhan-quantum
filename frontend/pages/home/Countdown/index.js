import React, { useState, useEffect } from 'react';
import s from '../../index.module.scss';

const Countdown = () => {
  const [countdownDate, setCountdownDate] = useState(new Date('12/25/2021').getTime());
  const [state, setState] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
     setNewTime()
  }, []);

  const setNewTime = () => {
      let countdownInterval = setInterval(() => {
        if (countdownDate > new Date().getTime()) {
            const currentTime = new Date().getTime();

            const distanceToDate = countdownDate - currentTime;

            let days = Math.floor(distanceToDate / (1000 * 60 * 60 * 24));
            let hours = Math.floor(
                (distanceToDate % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            );
            let minutes = Math.floor(
                (distanceToDate % (1000 * 60 * 60)) / (1000 * 60),
            );
            let seconds = Math.floor((distanceToDate % (1000 * 60)) / 1000);

            const numbersToAddZeroTo = [1, 2, 3, 4, 5, 6, 7, 8, 9];

            days = `${days}`;
            if (numbersToAddZeroTo.includes(hours)) {
                hours = `0${hours}`;
            } else if (numbersToAddZeroTo.includes(minutes)) {
                minutes = `0${minutes}`;
            } else if (numbersToAddZeroTo.includes(seconds)) {
                seconds = `0${seconds}`;
            }
            // console.log(state.days, state.hours, state.minutes, state.seconds)
            setState({ days: days, hours: hours, minutes, seconds });
        } else {
            clearInterval(countdownInterval);
        }   
      }, 1000)

  };

  return (
    <div className={`${s.promo__indication}`}>
        <section className={s.promo__indication__block}>
        <h5 className={"mb-0"}>{parseInt(state.days) < 0 ? '0' : state.days}</h5>
        <p className={"mb-0"}>days</p>
        </section>
        <section className={s.promo__indication__block}>
        <h5 className={"mb-0"}>{parseInt(state.hours) < 0 ? '0' : state.hours}</h5>
        <p className={"mb-0"}>hours</p>
        </section>
        <section className={s.promo__indication__block}>
        <h5 className={"mb-0"}>{parseInt(state.minutes) < 0 ? '0' : state.minutes}</h5>
        <p className={"mb-0"}>mins</p>
        </section>
        <section className={s.promo__indication__block}>
        <h5 className={"mb-0"}>{parseInt(state.seconds) < 0 ? '0' : state.seconds}</h5>
        <p className={"mb-0"}>secs</p>
        </section>
    </div>
  );
};

export async function getServerSideProps(context) {
    // const res = await axios.get("/products");
    // const products = res.data.rows;

    return {
        props: {  }, // will be passed to the page component as props
    };
}

export default Countdown;
