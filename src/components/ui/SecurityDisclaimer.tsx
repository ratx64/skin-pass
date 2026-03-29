import { useState } from 'react';
import {
  FaShieldAlt,
  FaExclamationTriangle,
  FaLock,
  FaChevronDown,
  FaInfoCircle,
  FaTimes,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export const SecurityDisclaimer = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="max-w-[540px] mx-auto rounded-sm cs2-panel p-3">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center space-x-2">
            <FaShieldAlt className="text-[#f4d04f]" />
            <h3 className="cs2-hud-text text-[1.35rem] leading-none text-[#d9ecff]">What This Tool Is / Isn&apos;t</h3>
          </div>
          <FaChevronDown className="text-[#8eb2d6]" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          >
            <button
              aria-label="Close security details"
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-[540px] rounded-sm cs2-panel p-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="cs2-hud-text text-[1.45rem] leading-none text-[#e0f0ff]">Operational Briefing</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[#8eb2d6] hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-3">
                <div className="rounded-sm bg-[#1f2f3f]/95 border border-[#6f8fab]/35 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <FaInfoCircle className="text-[#8fe64d]" />
                    <h4 className="cs2-hud-text text-xl leading-none text-[#dbedff]">What this tool is</h4>
                  </div>
                  <p className="text-sm text-[#c7dff5]">
                    A local deterministic converter for CS2 inspect links. Same inputs always produce the same output.
                  </p>
                </div>

                <div className="rounded-sm bg-[#332128]/95 border border-[#b06363]/35 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <FaExclamationTriangle className="text-[#ffb592]" />
                    <h4 className="cs2-hud-text text-xl leading-none text-[#ffe3d5]">What this tool isn&apos;t</h4>
                  </div>
                  <p className="text-sm text-[#ffd0be]">
                    It is not a password manager and cannot protect against malware, keyloggers, or compromised browsers.
                  </p>
                </div>

                <div className="rounded-sm bg-[#1d2a39]/95 border border-[#6f8fab]/35 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <FaLock className="text-[#f4d04f]" />
                    <h4 className="cs2-hud-text text-xl leading-none text-[#e3f3ff]">Best practice</h4>
                  </div>
                  <p className="text-sm text-[#cde2f7]">
                    Add a secret phrase for privacy and store final credentials in a trusted password manager.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
