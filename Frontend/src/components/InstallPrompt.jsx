import {
    useEffect,
    useState
} from "react";

import {
    motion,
    AnimatePresence
} from "framer-motion";

const InstallPrompt = () => {

    const [
        deferredPrompt,
        setDeferredPrompt
    ] = useState(null);

    const [
        show,
        setShow
    ] = useState(false);

    useEffect(() => {

        const isInstalled =

            window.matchMedia(
                "(display-mode: standalone)"
            ).matches ||

            window.navigator.standalone;

        if (isInstalled)
            return;

        setShow(true);

        // HIDE AFTER 5 SECONDS
        const timer =
            setTimeout(() => {

                setShow(false);

            }, 5000);

        const handler = (e) => {

            e.preventDefault();

            setDeferredPrompt(e);

        };

        window.addEventListener(
            "beforeinstallprompt",
            handler
        );

        return () => {

            clearTimeout(timer);

            window.removeEventListener(
                "beforeinstallprompt",
                handler
            );

        };

    }, []);

    const handleInstall =
        async () => {

            try {

                if (deferredPrompt) {

                    deferredPrompt.prompt();

                    const result =
                        await deferredPrompt.userChoice;

                    if (
                        result.outcome ===
                        "accepted"
                    ) {

                        setShow(false);

                    }

                    return;

                }

                alert(

                    "To install BaatCheet:\n\nAndroid Chrome:\n⋮ Menu → Add to Home Screen\n\nDesktop Chrome:\n⋮ Menu → Install BaatCheet"

                );

            } catch (error) {

                console.log(error);

            }

        };

    return (

        <AnimatePresence>

            {show && (

                <motion.div

                    initial={{
                        y: -100,
                        opacity: 0
                    }}

                    animate={{
                        y: 0,
                        opacity: 1
                    }}

                    exit={{
                        y: -100,
                        opacity: 0
                    }}

                    transition={{
                        duration: 0.4
                    }}

                    className="
                    fixed
                    top-4
                    left-1/2
                    -translate-x-1/2
                    z-[9999]
                    bg-orange-500
                    text-white
                    px-5
                    py-3
                    rounded-2xl
                    shadow-xl
                    flex
                    items-center
                    gap-4
                    max-w-[95%]
                    w-fit
                    "

                >

                    <div>

                        <h3
                            className="
                            font-semibold
                            "
                        >

                            📱 Install BaatCheet

                        </h3>

                        <p
                            className="
                            text-xs
                            "
                        >

                            Add to home screen for faster access

                        </p>

                    </div>

                    <button

                        onClick={
                            handleInstall
                        }

                        className="
                        bg-white
                        text-orange-500
                        px-4
                        py-2
                        rounded-xl
                        font-semibold
                        cursor-pointer
                        hover:bg-orange-100
                        transition
                        "

                    >

                        Add

                    </button>

                </motion.div>

            )}

        </AnimatePresence>

    );

};

export default InstallPrompt;