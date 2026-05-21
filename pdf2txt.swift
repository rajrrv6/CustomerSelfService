import Foundation
import PDFKit

let arguments = CommandLine.arguments
guard arguments.count > 1 else {
    print("Usage: pdf2txt <pdf-file-path>")
    exit(1)
}

let pdfPath = arguments[1]
let url = URL(fileURLWithPath: pdfPath)
guard let document = PDFDocument(url: url) else {
    print("Failed to open PDF at \(pdfPath)")
    exit(1)
}

for i in 0..<document.pageCount {
    if let page = document.page(at: i), let text = page.string {
        print("--- PAGE \(i + 1) ---")
        print(text)
    }
}
