"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

interface Pokemon {
  id: number
  name: string
  nameDE: string
  nameEN: string
  sprite: string
  types: string[]
  generation: number
}

const TYPE_COLORS: Record<string, string> = {
  normal: "bg-gray-400",
  fire: "bg-orange-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-cyan-300",
  fighting: "bg-red-600",
  poison: "bg-purple-500",
  ground: "bg-yellow-600",
  flying: "bg-indigo-400",
  psychic: "bg-pink-500",
  bug: "bg-lime-500",
  rock: "bg-yellow-700",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-600",
  dark: "bg-gray-700",
  steel: "bg-gray-500",
  fairy: "bg-pink-300",
}

const TYPE_NAMES_DE: Record<string, string> = {
  normal: "Normal",
  fire: "Feuer",
  water: "Wasser",
  electric: "Elektro",
  grass: "Pflanze",
  ice: "Eis",
  fighting: "Kampf",
  poison: "Gift",
  ground: "Boden",
  flying: "Flug",
  psychic: "Psycho",
  bug: "Käfer",
  rock: "Gestein",
  ghost: "Geist",
  dragon: "Drache",
  dark: "Unlicht",
  steel: "Stahl",
  fairy: "Fee",
}

export default function PokedexApp() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null)

  useEffect(() => {
    fetchPokemon()
  }, [])

  useEffect(() => {
    filterPokemon()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemon, searchQuery, selectedType, selectedGeneration])

  const fetchPokemon = async () => {
    try {
      setLoading(true)
      // Fetch first 151 Pokemon (Generation 1) - you can increase this
      const limit = 151
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`)
      const data = await response.json()

      const pokemonDetails = await Promise.all(
        data.results.map(async (p: { name: string; url: string }) => {
          try {
            // Fetch Pokemon details
            const detailResponse = await fetch(p.url)
            const details = await detailResponse.json()

            // Fetch species for German name
            const speciesResponse = await fetch(details.species.url)
            const species = await speciesResponse.json()

            const germanName = species.names.find((n: { language: { name: string }; name: string }) => n.language.name === "de")?.name || details.name
            const englishName = species.names.find((n: { language: { name: string }; name: string }) => n.language.name === "en")?.name || details.name

            return {
              id: details.id,
              name: details.name,
              nameDE: germanName,
              nameEN: englishName,
              sprite: details.sprites.other["official-artwork"].front_default || details.sprites.front_default,
              types: details.types.map((t: { type: { name: string } }) => t.type.name),
              generation: details.id <= 151 ? 1 : details.id <= 251 ? 2 : details.id <= 386 ? 3 : 4,
            }
          } catch (error) {
            console.error(`Error fetching pokemon ${p.name}:`, error)
            return null
          }
        })
      )

      setPokemon(pokemonDetails.filter((p): p is Pokemon => p !== null))
    } catch (error) {
      console.error("Error fetching pokemon:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterPokemon = () => {
    let filtered = [...pokemon]

    // Filter by search query (German or English name)
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.nameDE.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.nameEN.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toString().includes(searchQuery)
      )
    }

    // Filter by type
    if (selectedType) {
      filtered = filtered.filter((p) => p.types.includes(selectedType))
    }

    // Filter by generation
    if (selectedGeneration) {
      filtered = filtered.filter((p) => p.generation === selectedGeneration)
    }

    setFilteredPokemon(filtered)
  }

  const allTypes = Array.from(new Set(pokemon.flatMap((p) => p.types)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-purple-500 to-blue-500">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
              Pokédex
            </h1>
            <Sparkles className="h-8 w-8 text-yellow-500" />
          </div>

          {/* Search */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Pokemon (z.B. Pikachu, Glurak)..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            {/* Type Filters */}
            <div>
              <p className="text-sm font-medium mb-2">Typ Filter:</p>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-2 pb-2">
                  <Button
                    variant={selectedType === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(null)}
                  >
                    Alle Typen
                  </Button>
                  {allTypes.sort().map((type) => (
                    <Button
                      key={type}
                      variant={selectedType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedType(type)}
                      className={selectedType === type ? TYPE_COLORS[type] : ""}
                    >
                      {TYPE_NAMES_DE[type] || type}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Generation Filters */}
            <div>
              <p className="text-sm font-medium mb-2">Generation Filter:</p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedGeneration === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGeneration(null)}
                >
                  Alle Generationen
                </Button>
                {[1, 2, 3, 4].map((gen) => (
                  <Button
                    key={gen}
                    variant={selectedGeneration === gen ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedGeneration(gen)}
                  >
                    Gen {gen}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mt-4">
            {loading ? "Lade Pokemon..." : `${filteredPokemon.length} Pokemon gefunden`}
          </p>
        </div>
      </header>

      {/* Pokemon Grid */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(20)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4">
                  <Skeleton className="w-full h-40 mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredPokemon.map((p) => (
              <Card
                key={p.id}
                className="overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer group"
              >
                <CardContent className="p-4">
                  {/* Pokemon Image */}
                  <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 mb-3">
                    <div className="absolute top-2 right-2 bg-background/80 rounded-full px-2 py-1">
                      <span className="text-xs font-bold text-muted-foreground">#{p.id.toString().padStart(3, '0')}</span>
                    </div>
                    <Image
                      src={p.sprite}
                      alt={p.nameDE}
                      width={128}
                      height={128}
                      className="w-full h-32 object-contain group-hover:scale-110 transition-transform duration-200"
                      unoptimized
                    />
                  </div>

                  {/* Pokemon Names */}
                  <div className="space-y-1 mb-3">
                    <h3 className="font-bold text-lg truncate">{p.nameDE}</h3>
                    <p className="text-sm text-muted-foreground truncate">{p.nameEN}</p>
                  </div>

                  {/* Pokemon Types */}
                  <div className="flex gap-1 flex-wrap">
                    {p.types.map((type) => (
                      <Badge
                        key={type}
                        className={`${TYPE_COLORS[type]} text-white text-xs`}
                      >
                        {TYPE_NAMES_DE[type] || type}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredPokemon.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">Keine Pokemon gefunden</p>
            <p className="text-sm text-muted-foreground mt-2">
              Versuche einen anderen Suchbegriff oder Filter
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
