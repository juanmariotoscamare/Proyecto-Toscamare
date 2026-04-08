"use client";

import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  Search,
  Package,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import Papa from "papaparse";

interface Product {
  name: string;
  category: string;
}

interface SelectedProduct {
  name: string;
  quantity: number;
  unit: string;
}

const UNITS = ["Uds", "Kg", "gr"];

const API_URL =
  import.meta.env.VITE_API_URL_PRODUCCION || "http://localhost:3001";

interface Props {
  formType: "pedidos" | "contacto";
  setFormType: (type: "pedidos" | "contacto") => void;
}

export default function ContactForm({ formType, setFormType }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formLoadTime, setFormLoadTime] = useState(Date.now());

  // Estado para el buscador de productos
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    [],
  );
  const [showResults, setShowResults] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // 1. Cargar productos seleccionados del localStorage al inicio
  useEffect(() => {
    const savedProducts = localStorage.getItem("toscamare_pedido_pendiente");
    if (savedProducts) {
      try {
        setSelectedProducts(JSON.parse(savedProducts));
      } catch (e) {
        console.error("Error cargando pedido pendiende del localStorage", e);
      }
    }
  }, []);

  // 2. Guardar productos seleccionados en el localStorage cada vez que cambien
  useEffect(() => {
    if (selectedProducts.length > 0) {
      localStorage.setItem(
        "toscamare_pedido_pendiente",
        JSON.stringify(selectedProducts),
      );
    } else {
      localStorage.removeItem("toscamare_pedido_pendiente");
    }
    // Notificar al resto de la app (Header)
    window.dispatchEvent(new Event("cart-updated"));

    // SCROLL AL RESUMEN SI VIENE CON EL HASH
    if (
      selectedProducts.length > 0 &&
      window.location.hash === "#pedido-resumen"
    ) {
      setTimeout(() => {
        const element = document.getElementById("pedido-resumen");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 300); // Un poco más de tiempo para asegurar el render
    }
  }, [selectedProducts]);

  // Cargar productos al inicio
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/productos_destacados.csv");
        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const products = (results.data as Array<Record<string, string>>)
              .map((row) => ({
                name: row.Nombre || row.nombre,
                category: row.Categoria || row.categoria,
              }))
              .filter((p: Product) => p.name);
            setAllProducts(products);
          },
        });
      } catch (err) {
        console.error("Error cargando productos para el buscador:", err);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = allProducts
    .filter(
      (p) =>
        p.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(
            searchQuery
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, ""),
          ) && !selectedProducts.some((sp) => sp.name === p.name),
    )
    .slice(0, 8);

  const handleSelectProduct = (productName: string) => {
    setSelectedProducts([
      ...selectedProducts,
      { name: productName, quantity: 1, unit: "Uds" },
    ]);
    setSearchQuery("");
    setShowResults(false);
  };

  const handleUpdateProduct = (
    productName: string,
    quantity: number,
    unit: string,
  ) => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.name === productName) {
          return { ...p, quantity, unit };
        }
        return p;
      }),
    );
  };

  const handleRemoveProduct = (productName: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.name !== productName));
  };

  const handleClearAll = () => {
    setSelectedProducts([]);
    setShowClearConfirm(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const form = e.currentTarget;
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(form);

    // Anti-bot: honeypot
    if (formData.get("website")) {
      setError("Error de validación");
      setIsSubmitting(false);
      return;
    }

    // Anti-bot: tiempo mínimo
    const timeElapsed = Date.now() - formLoadTime;
    if (timeElapsed < 3000) {
      setError("Por favor, tómate un momento para completar el formulario");
      setIsSubmitting(false);
      return;
    }

    const productSummary = selectedProducts
      .map((p) => `${p.quantity} ${p.unit} de ${p.name}`)
      .join(", ");

    const data = {
      formType,
      fullName: formData.get("fullName"),
      companyName: formData.get("companyName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      // Si es un pedido, el asunto incluye los productos seleccionados
      subject:
        formType === "pedidos"
          ? `PEDIDO: ${productSummary || formData.get("subject")}`
          : formData.get("subject"),
      message: formData.get("message"),
      selectedProducts,
      formLoadTime,
    };

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Error al enviar el mensaje");
      }

      localStorage.removeItem("toscamare_pedido_pendiente"); // 3. Limpiar almacenamiento al enviar con éxito
      setIsSubmitted(true);
      form.reset();
      setSelectedProducts([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al enviar el mensaje",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewMessage = () => {
    setIsSubmitted(false);
    setError(null);
    setFormLoadTime(Date.now());
    setSelectedProducts([]);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center scale-up-center">
        <div className="mb-4 rounded-full bg-primary/10 p-4">
          <CheckCircle className="h-12 w-12 text-primary" />
        </div>
        <h3 className="mb-2 text-2xl font-semibold">
          {formType === "pedidos" ? "Pedido enviado" : "Mensaje enviado"}
        </h3>
        <p className="text-muted-foreground">
          Gracias por {formType === "pedidos" ? "tu pedido" : "contactarnos"}.
          Te responderemos pronto.
        </p>
        <Button variant="outline" className="mt-6" onClick={handleNewMessage}>
          Enviar otro {formType === "pedidos" ? "pedido" : "mensaje"}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Selector de tipo de formulario */}
        <div className="flex p-1 bg-muted rounded-xl gap-1 w-full max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setFormType("pedidos")}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all duration-500 cursor-pointer ${
              formType === "pedidos"
                ? "bg-white text-[#011468] shadow-sm scale-[1.02]"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50"
            }`}
          >
            Hacer un pedido
          </button>
          <button
            type="button"
            onClick={() => setFormType("contacto")}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all duration-500 cursor-pointer ${
              formType === "contacto"
                ? "bg-white text-[#011468] shadow-sm scale-[1.02]"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50"
            }`}
          >
            Contacto general
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot */}
          <input
            type="text"
            name="website"
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Tu nombre y apellidos"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Nombre comercial (opcional)</Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="Nombre de tu negocio"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono de contacto (opcional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="600 000 000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              {formType === "pedidos"
                ? "Notas adicionales o instrucciones"
                : "Mensaje"}
            </Label>
            <Textarea
              id="message"
              name="message"
              rows={4}
              placeholder={
                formType === "pedidos"
                  ? "Ej: Reparto por la mañana..."
                  : "Escribe aquí tu duda..."
              }
              required
            />
          </div>

          {/* BUSCADOR DE PRODUCTOS / ASUNTO */}
          <div className="space-y-4 pt-4 border-t border-muted-foreground/10">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="productSearch">
                {formType === "pedidos"
                  ? "Añade más productos a tu pedido"
                  : "Asunto de tu consulta"}
              </Label>
              {formType === "pedidos" && (
                <Link
                  to="/productos"
                  className="text-[10px] font-black text-[#011468]/50 hover:text-[#D90414] transition-all flex items-center gap-1 group whitespace-nowrap tracking-widest hover:translate-x-1"
                >
                  VOLVER AL CATÁLOGO
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              )}
            </div>

            {formType === "pedidos" ? (
              <div className="space-y-4">
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-[#011468] transition-colors" />
                  <Input
                    id="productSearch"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    className="pl-11 h-12 rounded-xl border-muted-foreground/20 focus:border-[#011468] focus:ring-0"
                    placeholder="Busca aquí productos para añadir..."
                  />

                  {/* Resultados de búsqueda */}
                  {showResults && searchQuery.length > 1 && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-border rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
                      <div className="max-h-[300px] overflow-y-auto">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((p, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectProduct(p.name)}
                              className="w-full text-left px-5 py-3.5 hover:bg-muted flex flex-col gap-0.5 border-b last:border-0 border-border/50 transition-colors"
                            >
                              <span className="font-bold text-sm text-[#011468]">
                                {p.name}
                              </span>
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                                {p.category}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="px-5 py-4 text-sm text-muted-foreground italic">
                            No se encontraron productos
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowResults(false)}
                        className="w-full py-2 bg-muted/30 text-[10px] text-center font-bold tracking-widest text-[#011468] hover:bg-muted transition-colors uppercase"
                      >
                        Cerrar buscador
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Input
                id="subject"
                name="subject"
                placeholder="Escribe el motivo aquí..."
                required
              />
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* LISTA DE PRODUCTOS SELECCIONADOS */}
          {formType === "pedidos" && selectedProducts.length > 0 && (
            <div
              id="pedido-resumen"
              className="pt-6 border-t border-dashed border-muted-foreground/30 animate-in slide-in-from-bottom-4 duration-700 scroll-mt-24"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black text-[#011468]/50 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Package className="h-3 w-3" /> Resumen de tu pedido
                  seleccionado
                </h4>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-all duration-300 uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-red-50 cursor-pointer border border-transparent hover:border-red-200"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Borrar todo
                </button>
              </div>

              <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedProducts.map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#011468]/10 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-[#011468]/5 p-2 rounded-lg">
                        <Package className="h-4 w-4 text-[#011468]" />
                      </div>
                      <span className="font-bold text-sm text-[#011468] truncate max-w-[150px] md:max-w-[250px]">
                        {p.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-xl">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={p.quantity}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val))
                              handleUpdateProduct(p.name, val, p.unit);
                          }}
                          className="w-16 h-10 px-2 rounded-lg bg-white border border-border font-bold text-[#011468] text-center focus:ring-2 focus:ring-[#D4AF37] outline-none"
                        />
                        <select
                          value={p.unit}
                          onChange={(e) =>
                            handleUpdateProduct(
                              p.name,
                              p.quantity,
                              e.target.value,
                            )
                          }
                          className="h-10 px-2 rounded-lg bg-white border border-border font-bold text-[#011468] text-xs cursor-pointer focus:ring-2 focus:ring-[#D4AF37] outline-none"
                        >
                          {UNITS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(p.name)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Eliminar producto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6">
            <Button
              type="submit"
              className={`w-full font-black text-lg h-14 transition-all duration-500 cursor-pointer ${isSubmitting ? "" : "hover:scale-[1.01] shadow-xl bg-[#011468] hover:bg-[#D90414] hover:rotate-[0.5deg]"}`}
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Enviando..."
                : formType === "pedidos"
                  ? "CONFIRMAR PEDIDO"
                  : "ENVIAR MENSAJE"}
            </Button>
          </div>
        </form>
      </div>

      {/* Modal de confirmación personalizado - Usamos Portal para que sea independiente del contenedor del formulario */}
      {showClearConfirm &&
        createPortal(
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 cursor-default"
            onClick={() => setShowClearConfirm(false)}
          >
            <div
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-border scale-up-center cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#011468] mb-2">
                  ¿Vaciar pedido?
                </h3>
                <p className="text-gray-500 text-sm mb-8">
                  Esta acción eliminará todos los productos que has añadido. No
                  podrás deshacerlo.
                </p>
                <div className="flex flex-col w-full gap-3">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="w-full py-3.5 bg-red-600 text-white rounded-xl font-black text-sm hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200 cursor-pointer"
                  >
                    SÍ, BORRAR TODO
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="w-full py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all active:scale-95 cursor-pointer"
                  >
                    CANCELAR
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
