import React, { useState, useRef } from 'react';
import Card from './Card';
import Button from './Button';
import { XMarkIcon, DocumentArrowUpIcon } from './Icons';

interface KycModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

type DocType = 'passport' | 'drivers_license' | 'id_card';

const KycModal: React.FC<KycModalProps> = ({ onClose, onSubmit }) => {
  const [docType, setDocType] = useState<DocType>('passport');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const isSubmitDisabled = !frontImage || (docType !== 'passport' && !backImage);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    if (e.target.files && e.target.files[0]) {
      if (side === 'front') setFrontImage(e.target.files[0]);
      else setBackImage(e.target.files[0]);
    }
  };

  const FileUploadButton: React.FC<{
    label: string, 
    file: File | null, 
    onClick: () => void 
  }> = ({ label, file, onClick }) => (
    <button type="button" onClick={onClick} className="w-full text-left p-4 border-2 border-dashed border-border-dark rounded-2xl hover:border-primary transition-colors">
        <div className="flex items-center">
            <DocumentArrowUpIcon className="w-8 h-8 text-primary mr-4" />
            <div>
                <p className="font-semibold text-text-dark">{label}</p>
                {file ? 
                    <p className="text-sm text-success">{file.name}</p> :
                    <p className="text-sm text-text-muted-dark">Click to upload</p>
                }
            </div>
        </div>
    </button>
  );

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
      <Card className="w-11/12 max-w-md mx-auto !p-0">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted-dark hover:text-white transition-colors z-10" aria-label="Close">
          <XMarkIcon className="w-6 h-6" />
        </button>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="p-8 space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-text-dark">Identity Verification</h2>
                <p className="text-text-muted-dark mt-2">Please provide your identification documents.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-text-muted-dark mb-2 ml-1">Document Type</label>
                <div className="grid grid-cols-3 gap-2 bg-secondary p-1 rounded-2xl">
                    {(['Passport', "Driver's License", 'ID Card'] as const).map(label => {
                        const value = label.toLowerCase().replace(/'/g, '').replace(/ /g, '_') as DocType;
                        return (
                             <button
                                type="button"
                                key={value}
                                onClick={() => setDocType(value)}
                                className={`w-full py-2 rounded-lg font-bold text-sm transition-all duration-300 ${docType === value ? 'bg-card-dark text-primary shadow-md' : 'text-text-muted-dark'}`}
                            >
                                {label}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="space-y-4">
                 <FileUploadButton label="Upload Front" file={frontImage} onClick={() => frontInputRef.current?.click()} />
                 {docType !== 'passport' && (
                     <FileUploadButton label="Upload Back" file={backImage} onClick={() => backInputRef.current?.click()} />
                 )}
            </div>

            <input type="file" ref={frontInputRef} onChange={(e) => handleFileChange(e, 'front')} className="hidden" accept="image/png, image/jpeg" />
            <input type="file" ref={backInputRef} onChange={(e) => handleFileChange(e, 'back')} className="hidden" accept="image/png, image/jpeg" />
            
            <Button type="submit" className="w-full !py-4 !mt-8" disabled={isSubmitDisabled}>
              Submit for Verification
            </Button>
        </form>
      </Card>
    </div>
  );
};

export default KycModal;
