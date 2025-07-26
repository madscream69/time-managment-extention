import { useEffect, useState } from 'react';
import './App.scss';
import Focus from './components/Focus';
import Timer from "./components/Timer.tsx";

// Интерфейс для данных Unsplash
interface Photo {
    id: string; // Unsplash использует строковые ID
    width: number;
    height: number;
    url: string;
    alt: string | null;
    photographer: string | null;
    photographer_url: string | null;
    src: {
        original: string;
        large: string;
        medium: string;
        small: string;
    };
}

function App() {
    const [bg, setBg] = useState('');
    const [dataP, setDataP] = useState<Photo>();
    const [time, setTime] = useState(new Date());
    const [activeAboutPhoto, SetActiveAboutPhoto] = useState(false);
    const [focus, setFocus] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function getBg(attempt = 1, maxAttempts = 3) {
            try {
                setLoading(true);
                const apiKey = import.meta.env.VITE_UNSPLASH_API_KEY_ACCESS;
                if (!apiKey) {
                    throw new Error('Unsplash API key is missing');
                }

                // Запрос к Unsplash API для получения случайного изображения
                const url = `https://api.unsplash.com/photos/random?query=natural+mountains+forest+sea+ocean+sunset&orientation=landscape&w=1920&h=1080`;

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        Authorization: `Client-ID ${apiKey}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                // Логирование для отладки
                console.log('Unsplash API response:', data);

                // Проверка наличия результата
                if (!data || !data.urls) {
                    if (attempt < maxAttempts) {
                        console.log(`Attempt ${attempt} failed, retrying...`);
                        return getBg(attempt + 1, maxAttempts);
                    }
                    throw new Error('No valid image found');
                }

                // Формирование объекта Photo
                const photo: Photo = {
                    id: data.id,
                    width: data.width,
                    height: data.height,
                    url: data.links.html, // Ссылка на страницу изображения
                    alt: data.alt_description || null,
                    photographer: data.user.name || null,
                    photographer_url: data.user.links.html || null || undefined,
                    src: {
                        original: data.urls.full,
                        large: data.urls.regular, // ~1080p
                        medium: data.urls.small,
                        small: data.urls.thumb,
                    },
                };

                console.log('Selected image:', photo);
                setBg(photo.src.original); // Используем regular для оптимального размера
                setDataP(photo);
            } catch (error) {
                console.error('Fetch error:', error);
                setError('Failed to load background image');
            } finally {
                setLoading(false);
            }
        }
        getBg();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const timeString = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    function disableInterface():void {
        document.querySelector('.time__title')?.classList.toggle('disabled');
        document.querySelector('.about-photo ')?.classList.toggle('disabled');
        document.querySelector('.focus-btn ')?.classList.toggle('disabled');
        setFocus(!focus);
    }

    return (
        <>
            {/*{focus && <Focus disableFunc={disableInterface}/>}*/}
            <Timer initialTime = {1500000}></Timer>
            <div
                onClick={() => {
                    setFocus(focus && false);
                    console.log('parent');
                }}
                className="background"
            >
                <img className="background-img" src={bg} alt="bg" />
                <div className="onFocus">
                    <button
                        className="focus-btn"
                        onClick={(e) => {
                            e.stopPropagation();

                            disableInterface();
                            console.log('child');
                        }}
                    >
                        Let's focus right now!
                    </button>
                </div>
                <div className="time">
                    <h1 className="time__title">{timeString}</h1>
                </div>
                <div className="info">
                    <div
                        className={`about-photo ${activeAboutPhoto ? 'about-photo--active' : ''}`}
                        onClick={() => SetActiveAboutPhoto(!activeAboutPhoto)}
                    >
                        {activeAboutPhoto ? (
                            <>
                                <p className="author">Photographer: </p>
                                <a href={dataP?.photographer_url || undefined} className="author-link">
                                    {dataP?.photographer && dataP.photographer.length > 20
                                        ? `${dataP.photographer.slice(0, 20)}...`
                                        : dataP?.photographer || 'Unknown'}
                                </a>
                                <p className="original-img">Original: </p>
                                <a href={dataP?.url} className="img-link">
                                    {dataP?.alt && dataP.alt.length > 20
                                        ? `${dataP.alt.slice(0, 20)}...`
                                        : dataP?.alt || 'No description'}
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