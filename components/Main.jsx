import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";

// Move text on the screen
function DraggableText({ children, className }) {
    const ref = useRef(null);
    const pos = useRef({ x: 0, y: 0 });
    const dragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        function onMove(e) {
            if (!dragging.current) return;
            e.preventDefault();

            const clientX = e.touches?.[0]?.clientX ?? e.clientX;
            const clientY = e.touches?.[0]?.clientY ?? e.clientY;

            const dx = clientX - start.current.x;
            const dy = clientY - start.current.y;

            pos.current = { x: pos.current.x + dx, y: pos.current.y + dy };
            el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;

            start.current = { x: clientX, y: clientY };
        }

        function onDown(e) {
            e.preventDefault();
            dragging.current = true;

            const clientX = e.touches?.[0]?.clientX ?? e.clientX;
            const clientY = e.touches?.[0]?.clientY ?? e.clientY;

            start.current = { x: clientX, y: clientY };
            document.body.style.userSelect = "none";
        }

        function onUp() {
            dragging.current = false;
            document.body.style.userSelect = "";
        }

        el.addEventListener("mousedown", onDown);
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseup", onUp);

        el.addEventListener("touchstart", onDown, { passive: false });
        el.addEventListener("touchmove", onMove, { passive: false });
        el.addEventListener("touchend", onUp);

        return () => {
            el.removeEventListener("mousedown", onDown);
            el.removeEventListener("mousemove", onMove);
            el.removeEventListener("mouseup", onUp);

            el.removeEventListener("touchstart", onDown);
            el.removeEventListener("touchmove", onMove);
            el.removeEventListener("touchend", onUp);
        };
    }, []);

    return (
        <span
            ref={ref}
            className={className}
            style={{
                cursor: "grab",
                userSelect: "none",
                touchAction: "none",
                position: "absolute",
                zIndex: 2,
            }}
        >
            {children}
        </span>
    );
}


export default function Main() {
    const [meme, setMeme] = useState({
        topText: "One does not simply",
        bottomText: "Walk into Mordor",
        imageUrl: "https://i.imgflip.com/1bij.jpg",
    });
    const [allMemes, setAllMemes] = useState([]);

    useEffect(() => {
        fetch("https://api.imgflip.com/get_memes")
            .then((res) => res.json())
            .then((data) => setAllMemes(data.data.memes));
    }, []);

    function getMemeImage() {
        if (allMemes.length === 0) return;
        const randomNumber = Math.floor(Math.random() * allMemes.length);
        const newMemeUrl = allMemes[randomNumber].url;
        setMeme((prev) => ({ ...prev, imageUrl: newMemeUrl }));
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setMeme((prev) => ({ ...prev, [name]: value }));
    }

    function downloadMeme() {
        const memeElement = document.querySelector(".meme");
        if (!memeElement) return;

        html2canvas(memeElement, { useCORS: true }).then((canvas) => {
            const link = document.createElement("a");
            link.download = "meme.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
        });
    }

    return (
        <main>
            <div className="form">
                <label>
                    Top Text
                    <input
                        type="text"
                        placeholder="One does not simply"
                        name="topText"
                        onChange={handleChange}
                        value={meme.topText}
                    />
                </label>

                <label>
                    Bottom Text
                    <input
                        type="text"
                        placeholder="Walk into Mordor"
                        name="bottomText"
                        onChange={handleChange}
                        value={meme.bottomText}
                    />
                </label>

                <button onClick={getMemeImage}>Get a random new meme image</button>
            </div>

            <div className="meme">
                <img src={meme.imageUrl} alt="Meme" />
                <DraggableText className="top">{meme.topText}</DraggableText>
                <DraggableText className="bottom">{meme.bottomText}</DraggableText>
            </div>

            <button
                onClick={downloadMeme}
                style={{ width: "100%", marginTop: "10px" }}
            >
                Download Meme
            </button>
        </main>
    );
}