import React, { useState, useEffect } from 'react';
import { Volume2, Plus, SkipForward, CheckCircle, Clock, Users, Settings, RotateCcw, XCircle } from 'lucide-react';

export default function QueueRetrySystem() {
  const [queues, setQueues] = useState([]);
  const [currentQueue, setCurrentQueue] = useState(null);
  const [skippedQueues, setSkippedQueues] = useState([]);
  const [servedQueues, setServedQueues] = useState([]);
  const [counter, setCounter] = useState(1);
  const [queuePrefix, setQueuePrefix] = useState('A');
  const [retryLimit, setRetryLimit] = useState(3);
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const addQueue = () => {
    const newQueue = {
      id: Date.now(),
      number: `${queuePrefix}${counter.toString().padStart(3, '0')}`,
      timestamp: new Date(),
      retryCount: 0,
      status: 'waiting'
    };
    setQueues([...queues, newQueue]);
    setCounter(counter + 1);
  };

  const callNext = () => {
    if (isAnnouncing) return;

    let nextQueue = null;

    // Prioritas 1: Selalu habiskan antrian utama dulu
    if (queues.length > 0) {
      nextQueue = queues[0];
      setQueues(queues.slice(1));
    }
    // Prioritas 2: Setelah antrian utama habis, baru panggil yang di-skip
    else {
      const retriableSkipped = skippedQueues.find(q => q.retryCount < retryLimit);
      if (retriableSkipped) {
        nextQueue = retriableSkipped;
        setSkippedQueues(skippedQueues.filter(q => q.id !== retriableSkipped.id));
      }
    }

    if (nextQueue) {
      nextQueue.retryCount += 1;
      setCurrentQueue(nextQueue);
      announceQueue(nextQueue.number);
    }
  };

  const announceQueue = (number) => {
    setIsAnnouncing(true);
    // Simulasi pengumuman
    setTimeout(() => {
      setIsAnnouncing(false);
    }, 2000);

    // Gunakan Web Speech API jika tersedia
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Nomor antrian ${number}, silakan maju`);
      utterance.lang = 'id-ID';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const skipCurrent = () => {
    if (!currentQueue) return;

    if (currentQueue.retryCount < retryLimit) {
      // Masih bisa diulang, masukkan ke daftar skip
      setSkippedQueues([...skippedQueues, { ...currentQueue, status: 'skipped' }]);
    } else {
      // Sudah mencapai batas, anggap tidak hadir
      setServedQueues([...servedQueues, { ...currentQueue, status: 'absent' }]);
    }
    setCurrentQueue(null);
  };

  const cancelCurrent = () => {
    if (!currentQueue) return;
    
    // Langsung masukkan ke daftar dibatalkan dan hilangkan nomor
    setServedQueues([...servedQueues, { ...currentQueue, status: 'cancelled' }]);
    setCurrentQueue(null);
  };

  const serveCurrent = () => {
    if (!currentQueue) return;
    setServedQueues([...servedQueues, { ...currentQueue, status: 'served' }]);
    setCurrentQueue(null);
  };

  const resetSystem = () => {
    setQueues([]);
    setCurrentQueue(null);
    setSkippedQueues([]);
    setServedQueues([]);
    setCounter(1);
  };

  const stats = {
    waiting: queues.length,
    skipped: skippedQueues.length,
    served: servedQueues.filter(q => q.status === 'served').length,
    absent: servedQueues.filter(q => q.status === 'absent').length,
    cancelled: servedQueues.filter(q => q.status === 'cancelled').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Sistem Antrian Bank Syariah Universitas Cendekia Abditama (UCA)</h1>
            <p className="text-gray-600"></p> Muhammad Ansori_2222105135
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <Settings className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prefix Antrian
              </label>
              <input
                type="text"
                value={queuePrefix}
                onChange={(e) => setQueuePrefix(e.target.value.toUpperCase())}
                maxLength={1}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batas Panggilan Ulang: {retryLimit}x
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={retryLimit}
                onChange={(e) => setRetryLimit(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">{stats.waiting}</span>
            </div>
            <p className="text-sm text-blue-700 mt-2">Menunggu</p>
          </div>
          <div className="bg-yellow-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Clock className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-900">{stats.skipped}</span>
            </div>
            <p className="text-sm text-yellow-700 mt-2">Diskip</p>
          </div>
          <div className="bg-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-900">{stats.served}</span>
            </div>
            <p className="text-sm text-green-700 mt-2">Dilayani</p>
          </div>
          <div className="bg-red-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <SkipForward className="w-8 h-8 text-red-600" />
              <span className="text-2xl font-bold text-red-900">{stats.absent}</span>
            </div>
            <p className="text-sm text-red-700 mt-2">Tidak Hadir</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <XCircle className="w-8 h-8 text-gray-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.cancelled}</span>
            </div>
            <p className="text-sm text-gray-700 mt-2">Dibatalkan</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Display Panel */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-lg shadow-xl p-8 text-white">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Volume2 className="w-6 h-6" />
              Nomor Antrian Sekarang
            </h2>
            
            {currentQueue ? (
              <div className="text-center">
                <div className={`text-8xl font-bold mb-4 ${isAnnouncing ? 'animate-pulse' : ''}`}>
                  {currentQueue.number}
                </div>
                <div className="bg-white/20 rounded-lg p-4 mb-6">
                  <p className="text-lg">
                    Panggilan ke-{currentQueue.retryCount} dari {retryLimit}
                  </p>
                  {currentQueue.retryCount > 1 && (
                    <p className="text-sm mt-2 flex items-center justify-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Pemanggilan Ulang
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={serveCurrent}
                    disabled={isAnnouncing}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Hadir
                  </button>
                  <button
                    onClick={skipCurrent}
                    disabled={isAnnouncing}
                    className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <SkipForward className="w-5 h-5" />
                    Skip
                  </button>
                  <button
                    onClick={cancelCurrent}
                    disabled={isAnnouncing}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-2xl mb-6 opacity-75">Tidak ada antrian aktif</p>
                <button
                  onClick={callNext}
                  disabled={queues.length === 0 && skippedQueues.length === 0}
                  className="bg-white text-indigo-600 font-semibold py-4 px-8 rounded-lg hover:bg-gray-100 disabled:bg-gray-300 disabled:text-gray-500 transition"
                >
                  Panggil Antrian Berikutnya
                </button>
              </div>
            )}
          </div>

          {/* Skipped Queue List */}
          {skippedQueues.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                Antrian yang Diskip (Akan Dipanggil Ulang)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {skippedQueues.map((q) => (
                  <div key={q.id} className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 text-center">
                    <div className="font-bold text-xl text-yellow-900">{q.number}</div>
                    <div className="text-xs text-yellow-700 mt-1">
                      Skip {q.retryCount}/{retryLimit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Kontrol</h3>
            <div className="space-y-3">
              <button
                onClick={addQueue}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Tambah Antrian Baru
              </button>
              <button
                onClick={callNext}
                disabled={isAnnouncing || (queues.length === 0 && skippedQueues.length === 0)}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Volume2 className="w-5 h-5" />
                Panggil Berikutnya
              </button>
              <button
                onClick={resetSystem}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Reset Sistem
              </button>
            </div>
          </div>

          {/* Waiting Queue */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Antrian Menunggu</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {queues.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Belum ada antrian</p>
              ) : (
                queues.slice(0, 10).map((q, idx) => (
                  <div key={q.id} className="bg-blue-50 rounded-lg p-3 flex justify-between items-center">
                    <span className="font-semibold text-gray-800">{q.number}</span>
                    <span className="text-xs text-gray-600">
                      {idx === 0 ? 'Berikutnya' : `Urutan ${idx + 1}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}