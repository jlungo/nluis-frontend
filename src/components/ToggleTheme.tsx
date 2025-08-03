import { useThemeStore } from '@/store/themeStore';
import { Button } from './ui/button';
import { Laptop2, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
    const { mode, setMode } = useThemeStore();

    return (
        <div className='rounded-full border border-border p-0.5 transition-colors flex gap-0.5 items-center'>
            <Button
                variant='ghost'
                size='icon'
                onClick={() => setMode('light')}
                className={`rounded-full ${mode === 'light' && 'bg-primary/20'}`}
            >
                <span className='sr-only'>Light Mode</span>
                <Sun size={10} className={`${mode === 'light' && 'text-primary'}`} />
            </Button>
            <Button
                variant='ghost'
                size='icon'
                onClick={() => setMode('system')}
                className={`rounded-full ${mode === 'system' && 'bg-primary/20'}`}
            >
                <span className='sr-only'>System Theme</span>
                <Laptop2 size={10} className={`${mode === 'system' && 'text-primary'}`} />
            </Button>
            <Button
                variant='ghost'
                size='icon'
                onClick={() => setMode('dark')}
                className={`rounded-full ${mode === 'dark' && 'bg-primary/20'}`}
            >
                <span className='sr-only'>System Theme</span>
                <Moon size={10} className={`${mode === 'dark' && 'text-primary'}`} />
            </Button>
        </div>
    );
};

export default App;
