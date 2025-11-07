// Configuração do IndexedDB
const DB_NAME = 'AmborgueMuscDB';
const DB_VERSION = 1;
const STORE_NAME = 'songs';

let db;

// Inicialização do Banco de Dados
const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('Erro ao abrir banco de dados:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('Banco de dados aberto com sucesso!');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('name', 'name', { unique: false });
                store.createIndex('type', 'type', { unique: false });
                console.log('Object store criada com sucesso!');
            }
        };
    });
};

// Salvar música no IndexedDB
const saveSong = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async () => {
            try {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                
                const song = {
                    id: generateId(),
                    name: file.name,
                    type: file.type,
                    data: reader.result,
                    addedAt: new Date().toISOString()
                };

                const request = store.add(song);
                
                request.onsuccess = () => {
                    resolve(song);
                };

                request.onerror = () => {
                    reject(request.error);
                };

            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
};

// Obter todas as músicas
const getAllSongs = () => {
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        } catch (error) {
            reject(error);
        }
    });
};

// Obter uma música específica
const getSong = (id) => {
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        } catch (error) {
            reject(error);
        }
    });
};

// Remover uma música
const deleteSong = (id) => {
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        } catch (error) {
            reject(error);
        }
    });
};

// Utilitários
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Inicializar DB quando o documento carregar
document.addEventListener('DOMContentLoaded', initDB);