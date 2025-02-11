'use client'
import { Asset } from '@/server/db/schema/schema'
import React, { useEffect } from 'react'
import { Skeleton } from '../ui/skeleton'
import { AudioLines, FileMinus, Video, File, Dot, Trash } from 'lucide-react'
import { Button } from '../ui/button'
import { formatFileTokens } from '@/app/utils/formateFileTokens'
import { MAX_TOKENS_ASSETS } from '@/lib/constants'
import { cn } from '@/lib/utils'


interface UploadStepBodyProps {
    isLoading: boolean
    setDeleteAssetId: React.Dispatch<React.SetStateAction<string | null>>
    uploadedAssets: Asset[]
    assetJobStatus: Record<string, string>

}

function UploadStepBody({ setDeleteAssetId, isLoading, uploadedAssets, assetJobStatus }: UploadStepBodyProps) {
    const [isExceeded, setIsExceeded] = React.useState(false)
    const [formattedPercentage, setFormattedPercentage] = React.useState(0)
    const [usagePercentage, setUsagePercentage] = React.useState(0)

    useEffect(() => {
        const calculatedTotalTokens = uploadedAssets.reduce(
            (sum, file) => sum + (file.tokenCount || 0),
            0
        );

        const calculatedUsagePercentage = Math.min(
            (calculatedTotalTokens / MAX_TOKENS_ASSETS) * 100,
            100
        );
        setUsagePercentage(calculatedUsagePercentage);

        const calculatedFormattedPercentage = Math.round(calculatedUsagePercentage);
        setFormattedPercentage(calculatedFormattedPercentage);

        const exceeded = calculatedTotalTokens > MAX_TOKENS_ASSETS;
        setIsExceeded(exceeded);
    }, [uploadedAssets]);

    if (isLoading) {
        return (
            <div className='space-y-2 sm:space-y-3 md:space-y-4'>
                <Skeleton className='h-10 w-full rounded-xl' />
                <Skeleton className='h-10 w-full rounded-xl' />
                <Skeleton className='h-10 w-full rounded-xl' />
            </div>
        )
    }
    return (
        <div>
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-end mb-4 mt-3'>
                <h3 className='font-bold text-lg mb-2 sm:mb-0'>Uploaded Files:</h3>
                <div className="w-full sm:max-w-xs space-y-2">
                    <p
                        className={cn(
                            "text-sm text-center sm:text-right truncate",
                            isExceeded ? "text-red-500 font-medium" : "text-gray-600"
                        )}
                    >
                        {isExceeded
                            ? "Content Limit Exceeded. Please delete assets"
                            : `${formattedPercentage}% of ${MAX_TOKENS_ASSETS.toLocaleString()} tokens used`}
                    </p>
                    <div className="w-full bg-gray-300 rounded-full h-2.5 mb-1">
                        <div
                            className={cn(
                                "h-2.5 rounded-full",
                                isExceeded ? "bg-red-500" : "bg-main"
                            )}
                            style={{ width: `${usagePercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {uploadedAssets.length > 0 ? (
                <ul className='space-y-1'>
                    {uploadedAssets.map(asset => (
                        <li key={asset.id} className='flex items-center justify-between hover:bg-gray-100 rounded-lg transition-all duration-100 px-3 py-2 group'>
                            <span className="flex items-center text-semibold min-w-0 flex-1 mr-2">
                                <FileIconLoader fileType={asset.fileType} />
                                <div className="flex flex-col ml-3 w-full min-w-0">
                                    <span className="font-medium text-sm sm:text-base truncate">
                                        {asset.title}
                                    </span>
                                    <div className="flex flex-col sm:flex-row sm:items-center text-gray-500 w-full min-w-0">
                                        <p className="text-xs sm:text-sm truncate">
                                            Job Status: {assetJobStatus[asset.id] || 'Unknown'}
                                        </p>
                                        <Dot className="hidden sm:flex flex-shrink-0" />
                                        <p className="text-xs sm:text-sm truncate">
                                            Tokens: {formatFileTokens(asset.tokenCount || 0)}
                                        </p>
                                    </div>
                                </div>
                            </span>
                            <Button
                                onClick={() => setDeleteAssetId(asset.id)}
                                className="text-red-500 bg-transparent shadow-none hover:bg-transparent flex-shrink-0 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-100"
                            >
                                <Trash className="h-5 w-5" />
                                <span className="hidden lg:inline ml-2">Delete</span>
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 text-center">No assets found.</p> // ✅ Prevents UI break if no assets
            )}
        </div>
    )
}

export default UploadStepBody

function FileIconLoader({ fileType }: { fileType: string }) {
    switch (fileType) {
        case "video":
            return <Video className="h-5 w-5 flex-shrink-0 text-main" />;
        case "audio":
            return <AudioLines className="h-5 w-5 flex-shrink-0 text-main" />;
        case "text":
            return <File className="h-5 w-5 flex-shrink-0 text-main" />;
        case "markdown":
            return <FileMinus className="h-5 w-5 flex-shrink-0 text-main" />;
        default:
            return <File className="h-5 w-5 flex-shrink-0 text-main" />;
    }
}
