import { useEffect, useState } from "react";

const InstallPrompt = () => {

    const [
        deferredPrompt,
        setDeferredPrompt
    ] = useState(null);

    const [
        isInstalled,
        setIsInstalled
    ] = useState(false);

    useEffect(() => {

        // CHECK IF APP ALREADY INSTALLED
        if (

            window.matchMedia(
                "(display-mode: standalone)"
            ).matches

            ||

            window.navigator.standalone

        ) {

            setIsInstalled(true);

        }

        const handler = (e) => {

            e.preventDefault();

            setDeferredPrompt(e);

        };

        window.addEventListener(
            "beforeinstallprompt",
            handler
        );

        return () => {

            window.removeEventListener(
                "beforeinstallprompt",
                handler
            );

        };

    }, []);

    const handleInstall =
        async () => {

            if (!deferredPrompt)
                return;

            deferredPrompt.prompt();

            await deferredPrompt.userChoice;

        };

    if (isInstalled)
        return null;

    return (

        <div
            className="
            fixed
            bottom-5
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
            gap-3
            "
        >

            <span
                className="
                text-sm
                font-medium
                whitespace-nowrap
                "
            >

                📱 Add BaatCheet To Home Screen

            </span>

            <button

                onClick={
                    handleInstall
                }

                className="
                bg-white
                text-orange-500
                px-4
                py-1
                rounded-lg
                font-semibold
                cursor-pointer
                "
            >

                Add

            </button>

        </div>

    );

};

export default InstallPrompt;