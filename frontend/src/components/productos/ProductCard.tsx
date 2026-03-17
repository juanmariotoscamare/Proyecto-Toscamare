interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
}

interface Props {
  product: Product;
  onSelect: (product: Product) => void;
  index?: number;
}

export const ProductCard = ({ product, onSelect, index = 0 }: Props) => {
  return (
    <div 
      onClick={() => onSelect(product)}
      data-aos="fade-up"
      data-aos-duration="400"
      data-aos-delay={(index % 6) * 50}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col cursor-pointer"
    >
      {/* Imagen representativa */}
      <div className="relative h-64 overflow-hidden bg-gray-50 border-b border-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/95 backdrop-blur-md text-[#002B61] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md border border-blue-50/50">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1 justify-center bg-white">
        <h4 className="text-xl font-black text-[#002B61] group-hover:text-[#D4AF37] transition-colors leading-tight tracking-tight">
          {product.name}
        </h4>
      </div>
    </div>
  );
};
