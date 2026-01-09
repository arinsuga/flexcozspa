import React, { useState, useEffect, KeyboardEvent } from 'react';
import Button from './Button';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export default function Pagination({ currentPage, lastPage, onPageChange, className = '' }: PaginationProps) {
    const [inputPage, setInputPage] = useState(String(currentPage));

    useEffect(() => {
        setInputPage(String(currentPage));
    }, [currentPage]);

    if (lastPage <= 1) return null;

    const handlePageSubmit = () => {
        const pageNum = parseInt(inputPage);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= lastPage) {
            onPageChange(pageNum);
        } else {
            setInputPage(String(currentPage));
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handlePageSubmit();
        }
    };

    return (
        <div className={`flex justify-center items-center gap-4 ${className}`}>
             <Button
                 variant="outline"
                 size="sm"
                 disabled={currentPage <= 1}
                 onClick={() => onPageChange(currentPage - 1)}
                 leftIcon="chevron_left"
             >
                 Previous
             </Button>
             <div className="flex items-center gap-2">
                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Page</span>
                 <input
                     type="text"
                     className="w-12 h-8 text-center border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                     value={inputPage}
                     onChange={(e) => setInputPage(e.target.value)}
                     onBlur={handlePageSubmit}
                     onKeyDown={handleKeyDown}
                 />
                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">of {lastPage}</span>
             </div>
             <Button
                 variant="outline"
                 size="sm"
                 disabled={currentPage >= lastPage}
                 onClick={() => onPageChange(currentPage + 1)}
                 rightIcon="chevron_right"
             >
                 Next
             </Button>
        </div>
    );
}
