import { TestBed } from '@angular/core/testing';
import { DomSanitizer, BrowserModule } from '@angular/platform-browser';
import { Nl2brPipe } from './nl2br.pipe';

describe('Nl2brPipe', () => {
  let pipe: Nl2brPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule]
    });

    sanitizer = TestBed.inject(DomSanitizer);
    pipe = new Nl2brPipe(sanitizer);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform()', () => {
    it('should return empty string for null or undefined', () => {
      expect(pipe.transform(null as any)).toBe('');
      expect(pipe.transform(undefined as any)).toBe('');
      expect(pipe.transform('')).toBe('');
    });

    it('should convert newlines to <br> tags', () => {
      const input = 'Line 1\nLine 2\nLine 3';
      const result = pipe.transform(input);
      
      // Extract the HTML string from SafeHtml
      const htmlString = (result as any).changingThisBreaksApplicationSecurity;
      
      expect(htmlString).toContain('<br>');
      expect(htmlString).toBe('Line 1<br>Line 2<br>Line 3');
    });

    it('should convert ** to <strong> tags for bold text', () => {
      const input = 'This is **bold** text';
      const result = pipe.transform(input);
      
      const htmlString = (result as any).changingThisBreaksApplicationSecurity;
      
      expect(htmlString).toContain('<strong>bold</strong>');
      expect(htmlString).toBe('This is <strong>bold</strong> text');
    });

    it('should convert bullet points • to HTML entities', () => {
      const input = '• Item 1\n• Item 2';
      const result = pipe.transform(input);
      
      const htmlString = (result as any).changingThisBreaksApplicationSecurity;
      
      expect(htmlString).toContain('&bull;');
      expect(htmlString).toBe('&bull; Item 1<br>&bull; Item 2');
    });

    it('should handle multiple transformations together', () => {
      const input = '**Title**\n• Item 1\n• Item 2';
      const result = pipe.transform(input);
      
      const htmlString = (result as any).changingThisBreaksApplicationSecurity;
      
      expect(htmlString).toContain('<strong>Title</strong>');
      expect(htmlString).toContain('<br>');
      expect(htmlString).toContain('&bull;');
      expect(htmlString).toBe('<strong>Title</strong><br>&bull; Item 1<br>&bull; Item 2');
    });

    it('should handle text without special characters', () => {
      const input = 'Simple text without formatting';
      const result = pipe.transform(input);
      
      const htmlString = (result as any).changingThisBreaksApplicationSecurity;
      
      expect(htmlString).toBe('Simple text without formatting');
    });

    it('should handle multiple bold sections', () => {
      const input = '**First** and **Second** bold';
      const result = pipe.transform(input);
      
      const htmlString = (result as any).changingThisBreaksApplicationSecurity;
      
      expect(htmlString).toBe('<strong>First</strong> and <strong>Second</strong> bold');
    });

    it('should return SafeHtml type', () => {
      const input = 'Test';
      const result = pipe.transform(input);
      
      // Verify it's a SafeHtml object
      expect(result).toBeTruthy();
      expect(typeof result).toBe('object');
    });
  });
});
