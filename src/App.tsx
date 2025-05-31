import { useEffect, useState } from 'react';
import './App.css';
import Focus from './components/Focus';
function App() {
    interface Photo {
        id: number;
        width: number;
        height: number;
        url: string;
        alt: string | null;
        avg_color: string | null;
        photographer: string;
        photographer_url: string;
        photographer_id: number;
        liked: boolean;
        src: {
            original: string;
            large2x: string;
            large: string;
            medium: string;
            small: string;
            portrait: string;
            landscape: string;
            tiny: string;
        };
    }
    const [bg, setBg] = useState('');
    const [dataP, setDataP] = useState<Photo>();
    const [time, setTime] = useState(new Date());
    const [activeAboutPhoto, SetActiveAboutPhoto] = useState(false);
    const [focus, setFocus] = useState(false);

    useEffect(() => {
        async function getBg() {
            const url =
                'https://api.pexels.com/v1/search?query=natural%20mountains%20forest%20sea%20ocean%20sunset/?size=large&orientation=landscape&per_page=100';
            const apiKey = import.meta.env.VITE_API_KEY;

            return fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: apiKey, // Use "Bearer" or another scheme if required
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(
                            `HTTP error! status: ${response.status}`
                        );
                    }
                    return response.json();
                })
                .then((data) => {
                    const arrayData = Array.isArray(data.photos)
                        ? data.photos
                        : Object.values(data.photos);
                    let photo;
                    if (arrayData.length > 0) {
                        const randomIndex = Math.floor(
                            Math.random() * arrayData.length
                        ); // Генерация случайного индекса
                        photo = arrayData[randomIndex]; // Возвращаем случайный элемент
                    } else {
                        photo = arrayData[0]; // Или какое-то другое значение для пустого массива
                    }
                    setBg(photo?.src.original);
                    setDataP(photo);
                    console.log('Data received:', data);
                    // Process your data here
                })
                .catch((error) => {
                    console.error('Fetch error:', error);
                    // Handle errors appropriately
                });
        }
        getBg();
    }, []);
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        // Clear the interval when the component unmounts
        return () => clearInterval(interval);
    }, []);
    const hours = time.getHours();
    const minutes = time.getMinutes();

    const timeString = `${hours < 10 ? `0${hours}` : hours}:${
        minutes < 10 ? `0${minutes}` : minutes
    }`;
    return (
        <>
            {focus ? <Focus /> : <></>}
            <div
                onClick={() => {
                    setFocus(focus && false);
                    console.log('parent');
                }}
                className="background"
            >
                <img className="background-img" src={bg} alt="bg" />
                <div className="onFocus">
                    <p
                        className="focus-text"
                        onClick={(e) => {
                            e.stopPropagation();
                            setFocus(!focus);
                            console.log('child');
                        }}
                    >
                        Let's focus right now!
                    </p>
                </div>
                <div className="time">
                    <h1 className="time__title">{timeString}</h1>
                </div>
                <div className="info">
                    <div
                        className={`about-photo ${
                            activeAboutPhoto ? 'about-photo--active' : ''
                        }`}
                        onClick={() => SetActiveAboutPhoto(!activeAboutPhoto)}
                    >
                        {activeAboutPhoto ? (
                            <>
                                <p className="author">Photographer: </p>
                                <a
                                    href={dataP?.photographer_url}
                                    className="author-link"
                                >
                                    {dataP?.photographer &&
                                    dataP?.photographer?.length > 20
                                        ? `${dataP?.photographer?.slice(
                                              0,
                                              20
                                          )}...`
                                        : dataP?.photographer}
                                </a>
                                <p className="original-img">Original: </p>
                                <a href={dataP?.url} className="img-link">
                                    {dataP?.alt && dataP?.alt?.length > 20
                                        ? `${dataP?.alt?.slice(0, 20)}...`
                                        : dataP?.alt}
                                </a>
                            </>
                        ) : (
                            <p className="original-img">More about photo...</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;
